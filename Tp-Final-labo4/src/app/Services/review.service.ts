// src/app/Services/review.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { Review } from '../Interfaces/profilein';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private baseUrl = 'http://localhost:3000/comments';
  private http = inject(HttpClient);

  // 🔹 Reseñas por película (para MovieReview / ReviewList)
  getReviewsByMovieId(movieId: number | string): Observable<Review[]> {
    const idString = String(movieId); // normalizamos por las dudas
    return this.http.get<Review[]>(`${this.baseUrl}?idMovie=${idString}`);
  }

  // 🔹 Agregar reseña (ReviewList)
  addReview(reviewData: Review): Observable<Review> {
    return this.http.post<Review>(this.baseUrl, reviewData);
  }

  // 🔹 Editar reseña (lo usa saveEdit en ReviewList)
  updateReview(review: Review): Observable<Review> {
    // review.id tiene que venir seteado desde el componente
    return this.http.put<Review>(`${this.baseUrl}/${review.id}`, review);
  }

  // 🔹 Eliminar reseña por ID (ReviewList y AdminReviews)
  deleteReviewById(reviewId: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${reviewId}`);
  }

  // 🔹 Reseñas por usuario (perfil)
  getReviewsByUserId(profileId: number | string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}?idProfile=${profileId}`);
  }

  // 🔹 TODAS las reseñas (para AdminReviews)
  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.baseUrl).pipe(
      catchError(() => of([])),  // si explota, devolvemos []
    );
  }

  // 🔹 UNA reseña por ID (admin-reports, etc.)
  getReviewById(id: string | number): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/${id}`);
  }

  // 🔹 Reseña de un usuario para una película (si la necesitás)
  getUserReviewForMovie(userId: string | number, movieId: number) {
    return this.http.get<Review[]>(
      `${this.baseUrl}?idProfile=${userId}&idMovie=${movieId}`
    );
  }
}
