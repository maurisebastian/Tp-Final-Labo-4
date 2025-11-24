// src/app/Components/genres/genres.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TmdbService } from '../../Services/tmdb.service';
import { ProfileService } from '../../Services/profile.service';
import { AuthService } from '../../auth/auth-service';
import { Moviein } from '../../Interfaces/moviein';
import { TopBar } from '../top-bar/top-bar';
import { Footer } from '../../Shared/footer/footer';
import { Profile } from '../../Interfaces/profilein';

@Component({
  selector: 'app-genres',
  standalone: true,
  imports: [CommonModule, TopBar, Footer],
  templateUrl: './genres.html',
  styleUrls: ['./genres.css'],
})
export class Genres implements OnInit {

  private readonly tmdbService = inject(TmdbService);
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  movies: Moviein[] = [];
  selectedMovieIds = new Set<number>();

  isSaving = false;
  errorMsg = '';

  ngOnInit(): void {
    this.loadRandomMovies();
  }

  loadRandomMovies(keepSelected: boolean = false): void {
    this.tmdbService.getRandomMovies().subscribe({
      next: (response: any) => {
        const movies: Moviein[] = response.results ?? [];

        if (!keepSelected) {
          this.movies = movies;
          return;
        }

        const selectedMovies = this.movies.filter(m =>
          this.selectedMovieIds.has(m.id)
        );
        const selectedIds = new Set(selectedMovies.map(m => m.id));

        const newOnes = movies.filter(m => !selectedIds.has(m.id));

        this.movies = [...selectedMovies, ...newOnes];
      },
      error: () => {
        this.errorMsg = 'No se pudieron cargar más películas.';
      },
    });
  }

  toggleMovie(movie: Moviein): void {
    if (this.selectedMovieIds.has(movie.id)) {
      this.selectedMovieIds.delete(movie.id);
    } else {
      this.selectedMovieIds.add(movie.id);
    }
  }

  isSelected(movie: Moviein): boolean {
    return this.selectedMovieIds.has(movie.id);
  }
/*
  savePreferences(): void {
    console.log('🟣 savePreferences() disparado');

    this.errorMsg = '';

    if (this.selectedMovieIds.size === 0) {
      this.errorMsg = 'Elegí al menos una película.';
      return;
    }

    const activeSignal = this.authService.getActiveUser();
    const active = activeSignal();

    console.log('🟣 Usuario activo en Genres:', active);

    if (!active) {
      this.router.navigate(['/login']);
      return;
    }

    const selectedMovies = this.movies.filter(m =>
      this.selectedMovieIds.has(m.id)
    );

    const genreSet = new Set<number>();

    for (const m of selectedMovies) {
      let genreIds: number[] = [];

      const anyMovie = m as any;

      if (Array.isArray(anyMovie.genre_ids)) {
        genreIds = anyMovie.genre_ids;
      } else if (Array.isArray(m.genres)) {
        genreIds = m.genres.map(g => g.id);
      }

      genreIds.forEach(id => genreSet.add(id));
    }

    const favoriteGenres = Array.from(genreSet);

    console.log('🟣 Géneros detectados:', favoriteGenres);

    if (!active.id) {
      this.errorMsg = 'No se pudo identificar tu usuario.';
      return;
    }

    this.isSaving = true;

    // 👇 el service espera string, le pasamos String(id)
    this.profileService.updateFavoriteGenres(String(active.id), favoriteGenres)
      .subscribe({
        next: (ok: boolean) => {
          this.isSaving = false;
          if (ok) {
            const updatedUser: Profile = { ...active, favoriteGenres };
            activeSignal.set(updatedUser);
            this.router.navigate(['/']);
          } else {
            this.errorMsg = 'No se pudieron guardar las preferencias.';
          }
        },
        error: () => {
          this.isSaving = false;
          this.errorMsg = 'Error guardando preferencias.';
        }
      });
  }*/
 savePreferences(): void {
  console.log('🟣 savePreferences() disparado');

  this.errorMsg = '';

  if (this.selectedMovieIds.size === 0) {
    this.errorMsg = 'Elegí al menos una película.';
    return;
  }

  const activeSignal = this.authService.getActiveUser();
  const active = activeSignal();

  console.log('🟣 Usuario activo en Genres:', active);

  if (!active) {
    this.router.navigate(['/login']);
    return;
  }

  // ==========================
  // 1) Pelis seleccionadas
  // ==========================
  const selectedMovies = this.movies.filter(m =>
    this.selectedMovieIds.has(m.id)
  );

  // Por si el usuario se emociona y marca 30 pelis, limitamos un poco
  const limitedMovies = selectedMovies.slice(0, 10);

  // ==========================
  // 2) Sacar GÉNEROS (como ya hacías)
  // ==========================
  const genreSet = new Set<number>();

  for (const m of limitedMovies) {
    const anyMovie = m as any;
    let genreIds: number[] = [];

    if (Array.isArray(anyMovie.genre_ids)) {
      genreIds = anyMovie.genre_ids;
    } else if (Array.isArray(m.genres)) {
      genreIds = m.genres.map(g => g.id);
    }

    genreIds.forEach(id => genreSet.add(id));
  }

  const favoriteGenres = Array.from(genreSet);
  console.log('🟣 Géneros detectados:', favoriteGenres);

  if (!active.id) {
    this.errorMsg = 'No se pudo identificar tu usuario.';
    return;
  }

  // ==========================
  // 3) Sacar ACTORES
  // ==========================
  const movieIds = limitedMovies
    .map(m => m.id)
    .filter(id => id != null) as number[];

  if (!movieIds.length) {
    this.errorMsg = 'No se pudieron obtener las películas seleccionadas.';
    return;
  }

  this.isSaving = true;

  const requests = movieIds.map(id =>
    this.tmdbService.getMovieCredits(id)
  );

  forkJoin(requests).subscribe({
    next: (creditsArray: any[]) => {
      const actorSet = new Set<number>();

      creditsArray.forEach(credits => {
        const cast = credits?.cast ?? [];

        // Tomamos, por ejemplo, los primeros 5 actores de cada película
        cast.slice(0, 5).forEach((actor: any) => {
          if (actor && actor.id != null) {
            actorSet.add(actor.id);
          }
        });
      });

      const favoriteActors = Array.from(actorSet);
      console.log('🟣 Actores detectados:', favoriteActors);

      // ==========================
      // 4) Guardar en el perfil (géneros + actores)
      // ==========================
      this.profileService
        .updateFavoritePreferences(String(active.id), favoriteGenres, favoriteActors)
        .subscribe({
          next: (ok: boolean) => {
            this.isSaving = false;

            if (!ok) {
              this.errorMsg = 'No se pudieron guardar las preferencias.';
              return;
            }

            // ✅ Actualizamos el usuario activo en memoria
            const updatedUser: Profile = {
              ...active,
              favoriteGenres,
              favoriteActors,
            };

            activeSignal.set(updatedUser);

            // 🚀 Volvemos al home: carrusel ya puede usar favoriteActors
            this.router.navigate(['/']);
          },
          error: () => {
            this.isSaving = false;
            this.errorMsg = 'Error guardando preferencias.';
          },
        });
    },
    error: () => {
      this.isSaving = false;
      this.errorMsg = 'No se pudieron obtener actores de las películas.';
    },
  });
}

}
