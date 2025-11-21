import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ReviewComment } from '../Interfaces/profilein';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComentService {

   private apiUrlComments = 'http://localhost:3000/reviewComments';
  private readonly http = inject(HttpClient);


  getComments(reviewId: number): Observable<ReviewComment[]> {
  return this.http.get<ReviewComment[]>(
    `${this.apiUrlComments}?idReview=${reviewId}`
  );
}

addComment(comment: ReviewComment): Observable<ReviewComment> {
  return this.http.post<ReviewComment>(this.apiUrlComments, comment);
}

deleteComment(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrlComments}/${id}`);
}
  
}
