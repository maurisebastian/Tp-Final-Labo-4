import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ProfileService } from './profile.service';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private tmdbBase = environment.tmdbApiBase;
  private key = environment.tmdbApiKey;

  constructor(
    private http: HttpClient,
    private profileService: ProfileService
  ) {}

  private discoverByGenres(genreIds: number[], maxResults = 8): Observable<any[]> {
    if (!genreIds || genreIds.length === 0) return of([]);

    const params = new HttpParams()
      .set('api_key', this.key)
      .set('with_genres', genreIds.join(','))
      .set('sort_by', 'vote_average.desc')
      .set('vote_count.gte', '50')
      .set('language', 'es-ES')
      .set('page', '1');

    return this.http.get<any>(`${this.tmdbBase}/discover/movie`, { params }).pipe(
      map(r => r?.results?.slice(0, maxResults) || []),
      catchError(() => of([]))
    );
  }

  private topRated(max = 12): Observable<any[]> {
    const params = new HttpParams()
      .set('api_key', this.key)
      .set('language', 'es-ES');

    return this.http.get<any>(`${this.tmdbBase}/movie/top_rated`, { params }).pipe(
      map(r => r?.results?.slice(0, max) || []),
      catchError(() => of([]))
    );
  }

  getRecommendationsForUser(userId: number, maxResults = 12): Observable<any[]> {
    return this.profileService.getProfile(userId).pipe(
      switchMap(profile => {
        const favs = profile?.favorites || [];
        const preferredGenres = profile?.preferredGenres || [];

        if (preferredGenres.length > 0) {
          return this.discoverByGenres(preferredGenres, maxResults);
        }

        if (favs.length > 0) {
          const calls = favs.slice(0, 5).map(id => {
            return this.http.get<any>(
              `${this.tmdbBase}/movie/${id}`,
              { params: new HttpParams().set('api_key', this.key).set('language', 'es-ES') }
            ).pipe(catchError(() => of(null)));
          });

          return forkJoin(calls).pipe(
            switchMap(detailsArr => {
              const genres = Array.from(
                new Set(detailsArr.filter(Boolean).flatMap((m: any) => m.genres.map((g: any) => g.id)))
              ).slice(0, 3);

              if (!genres.length) return this.topRated(maxResults);

              return this.discoverByGenres(genres, maxResults);
            })
          );
        }

        return this.topRated(maxResults);
      })
    );
  }
}
