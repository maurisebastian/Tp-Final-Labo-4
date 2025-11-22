import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminMovie } from '../Interfaces/admin-movies';

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
}
