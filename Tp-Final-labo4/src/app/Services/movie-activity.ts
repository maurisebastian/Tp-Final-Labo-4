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

 getActivitiesByUser(userId: number | string): Observable<MovieActivityInterface[]> {
  return this.http.get<MovieActivityInterface[]>(
    `${this.apiUrl}?idProfile=${String(userId)}`
  );
}

getWatchedMovies(userId: number | string) {
  return this.http.get<MovieActivityInterface[]>(
    `${this.apiUrl}?idProfile=${String(userId)}&status=watched`
  );
}

getToWatchMovies(userId: number | string): Observable<MovieActivityInterface[]> {
  return this.http.get<MovieActivityInterface[]>(
    `${this.apiUrl}?idProfile=${String(userId)}&status=towatch`
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

  deleteActivity(id: number) {
  return this.http.delete(`${this.apiUrl}/${id}`);
}

  
}
