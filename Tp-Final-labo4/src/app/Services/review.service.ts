import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

   private baseUrl = 'http://localhost:3000/comments';

   private http = inject(HttpClient);

  getReviewsByMovieId(movieId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}?idMovie=${movieId}`);
  }

  addReview(reviewData: { idProfile: number; idMovie: number; score: string; description: string }): Observable<any> {
    return this.http.post<any>(this.baseUrl, reviewData);
  }

  deleteReviewById(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${reviewId}`);
  }
  getReviewsByUserId(profileId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}?idProfile=${profileId}`);
  }
  
}
