import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LocalMovie {
  id: number | string;
  title: string;
  overview?: string;
  posterUrl?: string;
  tmdbId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class LocalMoviesService {
  private http = inject(HttpClient);

  // 🔧 Cambiá "adminMovies" por el recurso REAL de tu JSON Server
  private baseUrl = 'http://localhost:3000/adminMovies';

  searchByTitle(term: string): Observable<LocalMovie[]> {
    return this.http.get<LocalMovie[]>(
      `${this.baseUrl}?title_like=${encodeURIComponent(term)}`
    );
  }
}
