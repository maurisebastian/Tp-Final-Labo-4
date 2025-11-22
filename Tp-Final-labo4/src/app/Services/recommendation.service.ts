import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { MovieActivity } from './movie-activity';
import { TmdbService } from './tmdb.service';
import { AdminMoviesService } from './movies-service';

@Injectable({
  providedIn: 'root',
})
export class RecommendationService {
  private activityService = inject(MovieActivity);
  private tmdbService = inject(TmdbService);
  private adminMoviesService = inject(AdminMoviesService);

  getRecommendationsForUser(profileId: number): Observable<any[]> {
    return combineLatest([
      this.activityService.getActivitiesByUser(profileId),
      this.tmdbService.getTopRatedMovies(),
      this.adminMoviesService.getAll()
    ]).pipe(
      map(([activities, tmdbTop, localMovies]) => {

        // IDs de películas que YA vio
        const watchedIds = new Set(
          activities
            .filter(a => a.status === 'watched')
            .map(a => a.idMovie)
        );

        // TMDB
        const tmdbMovies = (tmdbTop?.results || []).map((m: any) => ({
          id: m.id,
          title: m.title,
          poster: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : null,
          genres: m.genre_ids || [],
        }));

        // Local JSON-server
        const local = localMovies.map((m: any) => ({
          id: m.id,
          title: m.title,
          poster: m.poster || null,
          genres: m.genres || [],
        }));

        const combined = [...tmdbMovies, ...local];

        // Filtrar repetidos y ya vistos
        const filtered = combined.filter(m => !watchedIds.has(m.id));

        // Cortar a 12 resultados
        return filtered.slice(0, 12);
      })
    );
  }
}
