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

  // 🔍 Buscar películas por texto
  searchMovies(query: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${query}`
    );
  }

  // ⭐ Las más puntuadas
  getTopRatedMovies(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/movie/top_rated?api_key=${this.apiKey}&language=es-US&page=1`
    );
  }

  // 📄 Detalle de película
  getMovieDetails(movieId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=es-US`
    );
  }

  // 🎯 Recomendaciones por género del usuario (ordenadas por puntuación)
  getMoviesByGenres(genres: number[], page: number = 1): Observable<any> {
    const genreParam = genres.join(',');

    return this.http.get(
      `${this.baseUrl}/discover/movie?api_key=${this.apiKey}` +
      `&language=es-US&sort_by=vote_average.desc&vote_count.gte=200` +
      `&with_genres=${genreParam}&page=${page}`
    );
  }

  // 🎲 Películas aleatorias (para selección de géneros)
  getRandomMovies(): Observable<any> {
    const randomPage = Math.floor(Math.random() * 20) + 1;
    return this.http.get(
      `${this.baseUrl}/movie/top_rated?api_key=${this.apiKey}&language=es-US&page=${randomPage}`
    );
  }

  // 💥 NUEVO: POPULARES POR GÉNERO
  getPopularByGenres(genres: number[], page: number = 1): Observable<any> {
    const genreParam = genres.join(',');

    return this.http.get(
      `${this.baseUrl}/discover/movie?api_key=${this.apiKey}` +
      `&language=es-US&sort_by=popularity.desc` +      // 👈 Popularidad
      `&with_genres=${genreParam}` +
      `&page=${page}`
    );
  }
}
