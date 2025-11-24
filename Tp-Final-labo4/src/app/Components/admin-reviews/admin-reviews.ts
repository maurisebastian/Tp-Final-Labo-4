import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router, RouterLink } from '@angular/router';

import { ReviewService } from '../../Services/review.service';
import { ProfileService } from '../../Services/profile.service';
import { TmdbService } from '../../Services/tmdb.service';
import { AuthService } from '../../auth/auth-service';
import { AdminMoviesService } from '../../Services/movies.service';

import { Profile, Review } from '../../Interfaces/profilein';

// Extendemos Review con campos solo de frontend
type ReviewWithMeta = Review & {
  userName?: string;
  movieName?: string;
};

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-reviews.html',
  styleUrl: './admin-reviews.css',
})
export class AdminReviewsComponent implements OnInit {
  private readonly reviewService = inject(ReviewService);
  private readonly profileService = inject(ProfileService);
  private readonly tmdbService = inject(TmdbService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly adminMovies = inject(AdminMoviesService);

  // ===== USUARIOS =====
  users: Profile[] = [];

  // ===== RESEÑAS / PELÍCULAS =====
  reviews: ReviewWithMeta[] = [];
  groupedReviews: { [movieId: string]: ReviewWithMeta[] } = {};
  filteredGroupedReviews: { [movieId: string]: ReviewWithMeta[] } = {};

  // títulos cacheados por id (numérico o string)
  movieTitles: { [id: string]: string } = {};

  // ===== BÚSQUEDA =====
  userSearch = '';
  movieSearch = '';

  get movieIds(): string[] {
    return Object.keys(this.filteredGroupedReviews);
  }

  ngOnInit(): void {
    const active = this.authService.getActiveUser()();

    if (!active || (active.role !== 'admin' && active.role !== 'superadmin')) {
      this.router.navigate(['/']);
      return;
    }

    this.loadUsers();
  }

  // =========== USUARIOS ===========
  private loadUsers(): void {
    this.profileService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loadReviews();
      },
      error: () => {
        console.error('Error al cargar usuarios para reseñas');
      },
    });
  }

  // =========== RESEÑAS ===========
  private loadReviews(): void {
  this.reviewService.getAllReviews().subscribe({
    next: (revs) => {
      // clonamos como ReviewWithMeta para poder agregar campos
      const revsWithMeta: ReviewWithMeta[] = revs.map((r) => ({ ...r }));

      // asignar nombre de usuario
      revsWithMeta.forEach((r) => {
        const user = this.users.find(
          (u) => String(u.id) === String(r.idProfile),
        );
        r.userName = user?.username ?? `Perfil ${r.idProfile}`;
      });

      this.reviews = revsWithMeta;
      this.groupedReviews = this.groupByMovie(this.reviews);
      this.applyFilters();

      // IDs únicos de películas (numéricos TMDB o strings locales)
      const uniqueIds = Array.from(
        new Set(
          revsWithMeta
            .map((r) => r.idMovie)
            .filter((id) => id !== null && id !== undefined)
            .map((id) => String(id)),
        ),
      );

      const numericIds = uniqueIds.filter((id) => /^\d+$/.test(id));
      const nonNumericIds = uniqueIds.filter((id) => !/^\d+$/.test(id));

      // ========== PELÍCULAS LOCALES (ID STRING) ==========
      nonNumericIds.forEach((id) => {
        // 🟢 casos raros: id vacío o raro → no intento ir a TMDB ni a movies
        if (id === '' || id === 'null' || id === 'undefined') {
          this.movieTitles[id] = 'Película desconocida';

          this.reviews
            .filter((r) => String(r.idMovie) === id)
            .forEach((r) => (r.movieName = 'Película desconocida'));

          this.groupedReviews = this.groupByMovie(this.reviews);
          this.applyFilters();
          return;
        }

        this.adminMovies
          .getById(id)
          .pipe(catchError(() => of(null)))
          .subscribe((localMovie) => {
            if (localMovie && (localMovie as any).title) {
              const title = (localMovie as any).title as string;
              this.movieTitles[id] = title;

              // asignar título a todas las reseñas con ese idMovie
              this.reviews
                .filter((r) => String(r.idMovie) === id)
                .forEach((r) => (r.movieName = title));
            } else {
              this.movieTitles[id] = 'Película local no encontrada';
            }

            this.groupedReviews = this.groupByMovie(this.reviews);
            this.applyFilters();
          });
      });

      // ========== PELÍCULAS TMDB (ID NUMÉRICO) ==========
      if (numericIds.length === 0) {
        // no hay pelis TMDB, ya está
        return;
      }

      const peticiones = numericIds.map((id) =>
        this.tmdbService.getMovieDetails(Number(id)).pipe(
          catchError(() => of({ title: 'Película sin datos' })),
        ),
      );

      forkJoin(peticiones).subscribe({
        next: (movies: any[]) => {
          movies.forEach((movie, index) => {
            const id = numericIds[index];

            const title =
              movie?.title || movie?.name || `ID ${id}`;
            this.movieTitles[id] = title;

            this.reviews
              .filter((r) => String(r.idMovie) === id)
              .forEach((r) => (r.movieName = title));
          });

          this.groupedReviews = this.groupByMovie(this.reviews);
          this.applyFilters();
        },
        error: () => {
          console.error('Error al obtener títulos de películas TMDB');
        },
      });
    },
    error: () => {
      console.error('Error al cargar reseñas');
    },
  });
}


  private groupByMovie(
    reviews: ReviewWithMeta[],
  ): { [movieId: string]: ReviewWithMeta[] } {
    const grouped: { [movieId: string]: ReviewWithMeta[] } = {};

    for (const r of reviews) {
      const key = String(r.idMovie);
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(r);
    }

    return grouped;
  }

  deleteReview(review: ReviewWithMeta): void {
    const ok = confirm(
      `¿Seguro que querés eliminar la reseña del usuario ${
        review.userName ?? review.idProfile
      } sobre la película ${review.movieName ?? review.idMovie}?`,
    );
    if (!ok) return;

    if (!review.id) {
      console.error('La reseña no tiene id, no se puede borrar');
      return;
    }

    this.reviewService.deleteReviewById(review.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter((r) => r.id !== review.id);
        this.groupedReviews = this.groupByMovie(this.reviews);
        this.applyFilters();
      },
      error: () => {
        alert('No se pudo eliminar la reseña.');
      },
    });
  }

  // =========== FILTROS ===========
  onUserSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value || '';
    this.userSearch = value.trim().toLowerCase();
    this.applyFilters();
  }

  onMovieSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value || '';
    this.movieSearch = value.trim().toLowerCase();
    this.applyFilters();
  }

  private applyFilters(): void {
    const userTerm = this.userSearch;
    const movieTerm = this.movieSearch;

    if (!userTerm && !movieTerm) {
      this.filteredGroupedReviews = this.groupedReviews;
      return;
    }

    const filtered = this.reviews.filter((r) => {
      const userName = (r.userName ?? '').toLowerCase();
      const movieName = (r.movieName ?? '').toLowerCase();

      const userOk = !userTerm || userName.includes(userTerm);
      const movieOk = !movieTerm || movieName.includes(movieTerm);

      return userOk && movieOk;
    });

    this.filteredGroupedReviews = this.groupByMovie(filtered);
  }

  getMovieTitle(movieId: string | number): string {
    const key = String(movieId);

    const fromMap = this.movieTitles[key];
    if (fromMap) return fromMap;

    const group = this.groupedReviews[key] ?? [];

    // fallback para películas locales o casos raros
    if (group[0]?.movieName && group[0].movieName.trim() !== '') {
      return group[0].movieName;
    }

    return '';
  }
  private fillMovieName(review: ReviewWithMeta): void {
  const id = review.idMovie;

  // 1) Reseñas viejas sin idMovie
  if (id == null) {
    review.movieName = 'Película desconocida';
    return;
  }

  const num = Number(id);

  // 2) TMDB (id numérico)
  if (!Number.isNaN(num)) {
    this.tmdbService.getMovieDetails(num).subscribe({
      next: (movie) => {
        review.movieName = movie.title;
      },
      error: (err) => {
        console.error('Error cargando película TMDB', err);
        review.movieName = 'Película (TMDB no encontrada)';
      },
    });
  }
  // 3) Película local (id string → adminMovies)
  else {
    this.adminMovies.getById(String(id)).subscribe({
      next: (local) => {
        if (local) {
          review.movieName = local.title;
        } else {
          review.movieName = 'Película local no encontrada';
        }
      },
      error: (err) => {
        console.error('Error cargando película local', err);
        review.movieName = 'Película local no encontrada';
      },
    });
  }
}

}
