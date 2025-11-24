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

  // Reseñas por película (para MovieReview / ReviewList)
  getReviewsByMovieId(movieId: number | string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}?idMovie=${movieId}`);
  }

  // Agregar reseña (ReviewList)
  addReview(reviewData: Review): Observable<Review> {
    return this.http.post<Review>(this.baseUrl, reviewData);
  }
 updateReview(review: Review): Observable<Review> {
  return this.http.put<Review>(`${this.baseUrl}/${review.id}`, review);
}
  // Eliminar reseña por ID (lo usan ReviewList y AdminReviews)
  deleteReviewById(reviewId: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${reviewId}`);
  }

  // Reseñas por usuario (si la necesitás en perfil)
  getReviewsByUserId(profileId: number | string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}?idProfile=${profileId}`);
  }

  // TODAS las reseñas (para AdminReviews)
  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.baseUrl).pipe(
      catchError(() => of([])),
    );
  }

  // Obtener UNA reseña por ID (usado en admin-reports)
  getReviewById(id: string | number): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/${id}`);
  }
  
  getUserReviewForMovie(userId: string | number, movieId: number) {
  return this.http.get<Review[]>(
    `${this.baseUrl}?idProfile=${userId}&idMovie=${movieId}`
  );
}
}
