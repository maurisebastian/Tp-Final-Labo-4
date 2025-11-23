import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminMovie } from '../Interfaces/admin-movies';
import { map } from 'rxjs/operators';  

@Injectable({
  providedIn: 'root',
})
export class AdminMoviesService {

  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/adminMovies';

  getAll(): Observable<AdminMovie[]> {
    return this.http.get<AdminMovie[]>(this.baseUrl);
  }

  create(movie: AdminMovie): Observable<AdminMovie> {
    return this.http.post<AdminMovie>(this.baseUrl, movie);
  }

  update(id: number | string, movie: Partial<AdminMovie>): Observable<AdminMovie> {
    return this.http.patch<AdminMovie>(`${this.baseUrl}/${id}`, movie);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

findByTmdbId(tmdbId: number): Observable<AdminMovie | null> {
    return this.http
      .get<AdminMovie[]>(`${this.baseUrl}?tmdbId=${tmdbId}`)
      .pipe(
        map((list) => (list.length > 0 ? list[0] : null))
      );
  }

}
