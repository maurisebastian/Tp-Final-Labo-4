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
    return this.http.get(`${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${query}`);
  }

  getTopRatedMovies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/top_rated?api_key=${this.apiKey}&language=es-US&page=1`);
  }
  getMovieDetails(movieId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=es-US`);
  }

  
}
