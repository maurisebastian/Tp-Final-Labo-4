import { inject, Injectable } from '@angular/core';
import { TmdbService } from './tmdb.service';
import { ProfileService } from './profile.service';
import { AuthService } from '../auth/auth-service';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { Profile } from '../Interfaces/profilein';

@Injectable({
  providedIn: 'root',
})
export class PreferenceService {

   private tmdb = inject(TmdbService);
  private profileService = inject(ProfileService);
  private auth = inject(AuthService);

  // weights recomendados (ajustalos a gusto)
  private readonly TOP_CAST_PER_MOVIE = 5;
  private readonly TOP_GENRES = 5;
  private readonly TOP_FAV_ACTORS = 5;

  /** Suma señal a géneros + actores a partir de una película TMDB */
  addSignalFromMovie(movieId: number, points: number) {
    const active = this.auth.getActiveUser()();
    if (!active?.id) return of(false);

    // Traemos detalles + credits en paralelo
    return forkJoin({
      details: this.tmdb.getMovieDetails(movieId),
      credits: this.tmdb.getMovieCredits(movieId),
    }).pipe(
      switchMap(({ details, credits }) => {
        // Géneros
        const genreIds: number[] = (details?.genres ?? [])
          .map((g: any) => g?.id)
          .filter((id: any) => id != null);

        // Actores (top N del cast)
        const actorIds: number[] = (credits?.cast ?? [])
          .slice(0, this.TOP_CAST_PER_MOVIE)
          .map((a: any) => a?.id)
          .filter((id: any) => id != null);

        // Stats actuales (copias)
        const genreStats: Record<string, number> = { ...(active.genreStats ?? {}) };
        const actorStats: Record<string, number> = { ...(active.actorStats ?? {}) };

        // Sumar puntos
        for (const gid of genreIds) {
          const k = String(gid);
          genreStats[k] = (genreStats[k] ?? 0) + points;
        }

        for (const aid of actorIds) {
          const k = String(aid);
          actorStats[k] = (actorStats[k] ?? 0) + points;
        }

        // Recalcular favoritos
        const favoriteGenres = this.recalcFavorites(genreStats, this.TOP_GENRES);
        const favoriteActors = this.recalcFavorites(actorStats, this.TOP_FAV_ACTORS);

        // Armar perfil actualizado
        const updated: Profile = {
          ...(active as any),
          genreStats,
          actorStats,
          favoriteGenres,
          favoriteActors,
        };

        // Guardar en DB + actualizar active user
        return this.profileService.updateProfile(updated, true).pipe(
          map((ok) => {
            if (ok) this.auth.setActiveUser(updated as any);
            return ok;
          })
        );
      })
    );
  }

  /** Ordena stats desc y devuelve top N IDs como number[] */
  private recalcFavorites(stats: Record<string, number>, limit: number): number[] {
    return Object.entries(stats)
      .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
      .slice(0, limit)
      .map(([id]) => Number(id));
  }
}
  

