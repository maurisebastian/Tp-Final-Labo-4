// src/app/Services/tmdb.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TmdbService {

  private apiKey: string = 'c130076811f0e957626523dba642db29';
  private baseUrl: string = 'https://api.themoviedb.org/3';
  private http = inject(HttpClient);

  searchMovies(query: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${query}`
    );
  }

  getTopRatedMovies(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/movie/top_rated?api_key=${this.apiKey}&language=es-US&page=1`
    );
  }

  getMovieDetails(movieId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=es-US`
    );
  }

  /**  NUEVO: Películas por géneros */
  getMoviesByGenres(genres: number[], page: number = 1): Observable<any> {
    const genreParam = genres.join(',');

    return this.http.get(
      `${this.baseUrl}/discover/movie?api_key=${this.apiKey}` +
      `&language=es-US&sort_by=vote_average.desc&vote_count.gte=200` +
      `&with_genres=${genreParam}&page=${page}`
    );
  }

  /** Esto es para la pantalla de selección */
  getRandomMovies(): Observable<any> {
    const randomPage = Math.floor(Math.random() * 20) + 1;
    return this.http.get(
      `${this.baseUrl}/movie/top_rated?api_key=${this.apiKey}&language=es-US&page=${randomPage}`
    );
  }

   getMovieCredits(movieId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/movie/${movieId}/credits?api_key=${this.apiKey}&language=es-US`
    );
  }

  /** Buscar actores por nombre */
  searchActors(query: string) {
    return this.http.get(
      `${this.baseUrl}/search/person?api_key=${this.apiKey}&language=es-US&query=${query}`
    );
  }

    // Películas en las que participa un actor
  getMoviesByActor(actorId: number) {
    return this.http.get(
      `${this.baseUrl}/person/${actorId}/movie_credits?api_key=${this.apiKey}&language=es-US`
    );
  }


  /**  Detalle de un actor (bio, foto, etc.) */
  getActorDetails(actorId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/person/${actorId}?api_key=${this.apiKey}&language=es-US`
    );
  }
  getActorMovies(actorId: number) {
  return this.http.get(
    `${this.baseUrl}/person/${actorId}/movie_credits?api_key=${this.apiKey}&language=es-US`
  );
}

}
