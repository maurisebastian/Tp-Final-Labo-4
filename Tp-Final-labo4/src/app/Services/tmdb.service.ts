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
  private readonly genres = [
    { id: 28, name: 'Acción' },
    { id: 12, name: 'Aventura' },
    { id: 16, name: 'Animación' },
    { id: 35, name: 'Comedia' },
    { id: 80, name: 'Crimen' },
    { id: 99, name: 'Documental' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Familia' },
    { id: 14, name: 'Fantasía' },
    { id: 36, name: 'Historia' },
    { id: 27, name: 'Terror' },
    { id: 10402, name: 'Música' },
    { id: 9648, name: 'Misterio' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Ciencia ficción' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Suspenso' },
    { id: 10752, name: 'Bélica' },
    { id: 37, name: 'Western' }
  ];

  // 🔹 Devolver todos los géneros
  getGenres() {
    return this.genres;
  }

  // 🔹 Devolver el nombre de un género por ID
  getGenreName(id: number): string | undefined {
    return this.genres.find(g => g.id === id)?.name;
  }

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

getMovieById(id: number) {
  return this.http.get(`https://api.themoviedb.org/3/movie/${id}?api_key=TU_API_KEY&language=es-ES`);
}


}
