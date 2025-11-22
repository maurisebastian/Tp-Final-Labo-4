import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { TmdbService } from './tmdb.service';
import { LocalMoviesService, LocalMovie } from './local-movies';

export interface SearchMovie {
  id: number | string;
  title: string;
  overview?: string;
  posterPath?: string | null;   // para pelis de TMDB
  posterUrl?: string | null;    // para pelis locales del admin
  voteAverage?: number | null;  // puntaje TMDB
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

  return forkJoin({
    tmdb: this.tmdb.searchMovies(query),
    local: this.local.searchByTitle(query),   // igual que antes
  }).pipe(
    map(({ tmdb, local }) => {
      const tmdbResults = (tmdb?.results ?? []) as any[];

      // 👉 FILTRO EXTRA por si el backend devuelve todas
      const filteredLocal = (local as LocalMovie[]).filter((m) =>
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

      const tmdbMapped: SearchMovie[] = tmdbResults.map((m) => ({
        id: m.id,
        title: m.title,
        overview: m.overview,
        posterPath: m.poster_path,
        posterUrl: null,
        voteAverage: m.vote_average ?? null,
        isLocal: false,
        tmdbId: m.id,
      }));

      return [...localMapped, ...tmdbMapped];
    })
  );
}

}
