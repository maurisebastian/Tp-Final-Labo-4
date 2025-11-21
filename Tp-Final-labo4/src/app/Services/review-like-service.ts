import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, of, switchMap } from 'rxjs';
import { ReviewLike } from '../Interfaces/reaction';

@Injectable({
  providedIn: 'root'
})
export class ReviewLikeService {

  
  
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/reviewLikes';

  // -------------------------------------------------
  // 1) OBTENER SI EXISTE LIKE
  // -------------------------------------------------
  getLike(userId: number, reviewId: number) {
    
    return this.http.get<ReviewLike[]>(
      `${this.baseUrl}?idProfile=${userId}&idReview=${reviewId}`
    );
  }

  // -------------------------------------------------
  // 2) AGREGAR LIKE
  // -------------------------------------------------
  addLike(userId: number, reviewId: number) {
    const payload: ReviewLike = {
      idProfile: userId,
      idReview: reviewId,
      date: new Date().toISOString(),
    };

    return this.http.post<ReviewLike>(this.baseUrl, payload).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  getLikesByReview(reviewId: number) {
  return this.http.get<ReviewLike[]>(`${this.baseUrl}?idReview=${reviewId}`);
}

  // -------------------------------------------------
  // 3) ELIMINAR LIKE
  // -------------------------------------------------
  removeLike(userId: number, reviewId: number) {
    return this.getLike(userId, reviewId).pipe(
      switchMap((likes) => {
        if (likes.length === 0) return of(false);

        const likeId = likes[0].id!;

        return this.http.delete(`${this.baseUrl}/${likeId}`).pipe(
          map(() => true),
          catchError(() => of(false))
        );
      }),
      catchError(() => of(false))
    );
  }

  // -------------------------------------------------
  // 4) TOGGLE LIKE (SI HAY LO BORRA, SI NO HAY LO CREA)
  // -------------------------------------------------
  toggleLike(userId: number, reviewId: number) {
    return this.getLike(userId, reviewId).pipe(
      switchMap((likes) => {
        if (likes.length > 0) {
          // Ya existe → eliminar
          const likeId = likes[0].id!;
          return this.http.delete(`${this.baseUrl}/${likeId}`).pipe(
            map(() => ({ liked: false })),
            catchError(() => of({ liked: false }))
          );
        } else {
          // No existe → agregar
          const payload: ReviewLike = {
            idProfile: userId,
            idReview: reviewId,
            date: new Date().toISOString(),
          };

          return this.http.post<ReviewLike>(this.baseUrl, payload).pipe(
            map(() => ({ liked: true })),
            catchError(() => of({ liked: false }))
          );
        }
      })
    );
  }
  
}
