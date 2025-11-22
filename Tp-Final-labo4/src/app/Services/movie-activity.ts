import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieActivityInterface } from '../Interfaces/reaction';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MovieActivity {

  
  private readonly apiUrl = 'http://localhost:3000/movieActivity';
  private readonly http = inject(HttpClient);

  // Obtener TODAS las actividades del usuario
  getActivitiesByUser(userId: number | string): Observable<MovieActivityInterface[]> {
    return this.http.get<MovieActivityInterface[]>(`${this.apiUrl}?idProfile=${userId}`);
  }

  // Obtener solo películas vistas
  getWatchedMovies(userId: number | string): Observable<MovieActivityInterface[]> {
    return this.http.get<MovieActivityInterface[]>(
      `${this.apiUrl}?idProfile=${userId}&status=watched`
    );
  }

  // Obtener solo películas por ver
  getToWatchMovies(userId: number | string): Observable<MovieActivityInterface[]> {
    return this.http.get<MovieActivityInterface[]>(
      `${this.apiUrl}?idProfile=${userId}&status=towatch`
    );
  }

  // Agregar actividad (vista o por ver)
  addActivity(activity: MovieActivityInterface): Observable<MovieActivityInterface> {
    return this.http.post<MovieActivityInterface>(this.apiUrl, activity);
  }

  // Actualizar el estado (por ejemplo de 'towatch' a 'watched')
  updateActivity(id: number, activity: Partial<MovieActivityInterface>): Observable<MovieActivityInterface> {
    return this.http.patch<MovieActivityInterface>(`${this.apiUrl}/${id}`, activity);
  }

  // Eliminar registro
  deleteActivity(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
}
