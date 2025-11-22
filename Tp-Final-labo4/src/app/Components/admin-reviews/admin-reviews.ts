import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { ReviewService } from '../../Services/review.service';
import { ProfileService } from '../../Services/profile.service';
import { TmdbService } from '../../Services/tmdb.service';
import { AuthService } from '../../auth/auth-service';
import { Router } from '@angular/router';

import { Profile, Review } from '../../Interfaces/profilein';

// Extendemos Review con campos solo de frontend
type ReviewWithMeta = Review & {
  userName?: string;
  movieName?: string;
};

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reviews.html',
  styleUrl: './admin-reviews.css',
})
export class AdminReviewsComponent implements OnInit {
  private readonly reviewService = inject(ReviewService);
  private readonly profileService = inject(ProfileService);
  private readonly tmdbService = inject(TmdbService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // ===== USUARIOS =====
  users: Profile[] = [];

  // ===== RESEÑAS / PELÍCULAS =====
  reviews: ReviewWithMeta[] = [];
  groupedReviews: { [movieId: string]: ReviewWithMeta[] } = {};
  filteredGroupedReviews: { [movieId: string]: ReviewWithMeta[] } = {};
  movieTitles: { [id: number]: string } = {};

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

        // IDs únicos de película
        const uniqueIds = Array.from(
          new Set(
            revsWithMeta
              .map((r) => r.idMovie)
              .filter((id) => id !== null && id !== undefined),
          ),
        ) as number[];

        if (uniqueIds.length === 0) return;

        const peticiones = uniqueIds.map((id) =>
          this.tmdbService.getMovieDetails(id),
        );

        forkJoin(peticiones).subscribe({
          next: (movies: any[]) => {
            movies.forEach((movie: any, index: number) => {
              const id = uniqueIds[index];
              const title = movie?.title || movie?.name || `ID ${id}`;
              this.movieTitles[id] = title;

              this.reviews
                .filter((r) => r.idMovie === id)
                .forEach((r) => (r.movieName = title));
            });

            this.groupedReviews = this.groupByMovie(this.reviews);
            this.applyFilters();
          },
          error: () => {
            console.error('Error al obtener títulos de películas');
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
}
