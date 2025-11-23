import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { TmdbService } from './tmdb.service';
import { LocalMoviesService, LocalMovie } from './local-movies';

export interface SearchMovie {
  id: number | string;
  title: string;
  overview?: string;
  posterPath?: string | null;   // TMDB
  posterUrl?: string | null;    // Local (admin)
  voteAverage?: number | null;  // puntaje
  isLocal: boolean;             // true = creada por admin
  tmdbId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class MovieSearchService {
  private tmdb = inject(TmdbService);
  private local = inject(LocalMoviesService);

  searchAll(query: string): Observable<SearchMovie[]> {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return of([]);

    return forkJoin({
      tmdb: this.tmdb.searchMovies(query),
      local: this.local.searchByTitle(query),
      actors: this.tmdb.searchActors(query),
    }).pipe(
      switchMap((res: any) => {
        const tmdbResults = (res.tmdb?.results ?? []);
        const localResults = (res.local ?? []);
        const actorResults = (res.actors?.results ?? []);

        // --- Películas Locales ---
        const localMapped: SearchMovie[] = localResults
          .filter((m: LocalMovie) =>
            m.title.toLowerCase().includes(normalizedQuery)
          )
          .map((m: LocalMovie) => ({
            id: m.id,
            title: m.title,
            overview: m.overview,
            posterPath: null,
            posterUrl: m.posterUrl ?? null,
            voteAverage: null,
            isLocal: true,
            tmdbId: m.tmdbId,
          }));

        // --- Películas por título en TMDB ---
        const tmdbMapped: SearchMovie[] = tmdbResults.map((m: any) => ({
          id: m.id,
          title: m.title,
          overview: m.overview,
          posterPath: m.poster_path,
          posterUrl: null,
          voteAverage: m.vote_average ?? null,
          isLocal: false,
          tmdbId: m.id,
        }));

        // Si NO hay actores → devolvemos solo películas
        if (actorResults.length === 0) {
          return of([...localMapped, ...tmdbMapped]);
        }

        // Si hay actor → buscamos películas del actor,
        // pero NO reemplazamos — sumamos
        const firstActor = actorResults[0];

        return this.tmdb.getMoviesByActor(firstActor.id).pipe(
          map((credits: any) => {
            const actorMovies = credits?.cast ?? [];

            const actorMapped: SearchMovie[] = actorMovies.map((m: any) => ({
              id: m.id,
              title: m.title,
              overview: m.overview,
              posterPath: m.poster_path,
              posterUrl: null,
              voteAverage: m.vote_average ?? null,
              isLocal: false,
              tmdbId: m.id,
            }));

            const merged = new Map<number | string, SearchMovie>();

            const add = (list: SearchMovie[]) => {
              list.forEach(item => {
                if (!merged.has(item.id)) merged.set(item.id, item);
              });
            };

            // Orden final:
            // 1) Locales
            // 2) Películas por nombre
            // 3) Películas del actor (si corresponde)
            add(localMapped);
            add(tmdbMapped);
            add(actorMapped);

            return Array.from(merged.values());
          })
        );
      })
    );
  }
}
