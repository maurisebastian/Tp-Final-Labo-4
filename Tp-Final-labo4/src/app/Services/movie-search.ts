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

    // 1) Buscamos películas por título, películas locales y actores
    return forkJoin({
      tmdb: this.tmdb.searchMovies(query),
      local: this.local.searchByTitle(query),
      actors: this.tmdb.searchActors(query),
    }).pipe(
      switchMap((res: any) => {
        const tmdbResults = (res.tmdb?.results ?? []) as any[];
        const actorsResults = (res.actors?.results ?? []) as any[];

        // 🎬 Películas locales (admin) – filtradas por título
        const filteredLocal = (res.local as LocalMovie[]).filter((m) =>
          m.title.toLowerCase().includes(normalizedQuery)
        );

        const localMapped: SearchMovie[] = filteredLocal.map((m) => ({
          id: m.id,
          title: m.title,
          overview: m.overview,
          posterPath: null,
          posterUrl: m.posterUrl ?? null,
          voteAverage: null,
          isLocal: true,
          tmdbId: m.tmdbId,
        }));

        // 🎬 Películas por título de TMDB (plan B si no hay actor)
        const tmdbMappedFromTitle: SearchMovie[] = tmdbResults.map((m) => ({
          id: m.id,
          title: m.title,
          overview: m.overview,
          posterPath: m.poster_path,
          posterUrl: null,
          voteAverage: m.vote_average ?? null,
          isLocal: false,
          tmdbId: m.id,
        }));

        // 👤 ¿Encontramos algún actor?
        const firstActor = actorsResults[0];

        // ❌ Si no hay ningún actor, devolvemos lo de siempre
        if (!firstActor) {
          return of([...localMapped, ...tmdbMappedFromTitle]);
        }

        // ✅ Si hay actor, pedimos TODAS las pelis donde actúa
        return this.tmdb.getMoviesByActor(firstActor.id).pipe(
          map((credits: any) => {
            const actorMovies = (credits?.cast ?? []) as any[];

            const actorMapped: SearchMovie[] = actorMovies.map((m) => ({
              id: m.id,
              title: m.title,
              overview: m.overview,
              posterPath: m.poster_path,
              posterUrl: null,
              voteAverage: m.vote_average ?? null,
              isLocal: false,
              tmdbId: m.id,
            }));

            // 🧠 Merge: primero locales, después películas del actor
            // (sin duplicar ids por las dudas)
            const merged = new Map<number | string, SearchMovie>();

            const pushList = (list: SearchMovie[]) => {
              list.forEach((item) => {
                if (!merged.has(item.id)) {
                  merged.set(item.id, item);
                }
              });
            };

            pushList(localMapped);
            pushList(actorMapped.length ? actorMapped : tmdbMappedFromTitle);

            return Array.from(merged.values());
          })
        );
      })
    );
  }
}
