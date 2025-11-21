import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReviewService } from '../../Services/review.service';
import { ProfileService } from '../../Services/profile.service';
import { TmdbService } from '../../Services/tmdb.service';
import { AuthService } from '../../auth/auth-service';
import { Router } from '@angular/router';

import { Profile, Review } from '../../Interfaces/profilein';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reviews.html',
  styleUrls: ['./admin-reviews.css'],
})
export class AdminReviewsComponent implements OnInit {

  private readonly reviewService = inject(ReviewService);
  private readonly profileService = inject(ProfileService);
  private readonly tmdbService = inject(TmdbService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // ===== USUARIOS (para saber nombres) =====
  users: Profile[] = [];

  // ===== RESEÑAS / PELÍCULAS =====
  reviews: Review[] = [];                           // todas las reseñas planas
  groupedReviews: { [movieId: string]: Review[] } = {};
  filteredGroupedReviews: { [movieId: string]: Review[] } = {};
  movieTitles: { [id: number]: string } = {};       // idMovie -> título

  // ===== BÚSQUEDA =====
  userSearch = '';
  movieSearch = '';

  // getter para iterar en el template SIN usar Object en el HTML
  get movieIds(): string[] {
    return Object.keys(this.filteredGroupedReviews);
  }

  ngOnInit(): void {
    const active = this.authService.getActiveUser()();

    // solo admin o superadmin pueden entrar
    if (!active || (active.role !== 'admin' && active.role !== 'superadmin')) {
      this.router.navigate(['/']);
      return;
    }

    // primero traigo usuarios, después reseñas
    this.loadUsers();
  }

  // ================= USUARIOS =================

  private loadUsers(): void {
    this.profileService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loadReviews();
      },
      error: () => {
        console.error('Error al cargar usuarios para reseñas');
      }
    });
  }

  // ================= RESEÑAS =================

  private loadReviews(): void {
    this.reviewService.getAllReviews().subscribe({
      next: (revs) => {
        // agregar nombre de usuario a cada reseña
        revs.forEach(r => {
          const user = this.users.find(u => String(u.id) === String(r.idProfile));
          r.userName = user?.username ?? `Perfil ${r.idProfile}`;
        });

        this.reviews = revs;

        // agrupado base
        this.groupedReviews = this.groupByMovie(this.reviews);

        // filtros iniciales (vacíos)
        this.applyFilters();

        // cargar títulos de películas
        const uniqueIds = Array.from(new Set(revs.map(r => r.idMovie)));

        uniqueIds.forEach(id => {
          if (this.movieTitles[id]) return;

          this.tmdbService.getMovieDetails(id).subscribe({
            next: (movie: any) => {
              const title = movie.title || movie.name || `ID ${id}`;
              this.movieTitles[id] = title;

              // asignar título a reseñas ya cargadas
              this.reviews
                .filter(r => r.idMovie === id)
                .forEach(r => (r.movieName = title));

              // recalcular agrupados con nombres
              this.groupedReviews = this.groupByMovie(this.reviews);
              this.applyFilters();
            },
            error: () => {
              this.movieTitles[id] = `ID ${id}`;
            }
          });
        });
      },
      error: () => {
        console.error('Error al cargar reseñas');
      }
    });
  }

  private groupByMovie(reviews: Review[]): { [movieId: string]: Review[] } {
    const grouped: { [movieId: string]: Review[] } = {};

    for (const r of reviews) {
      const key = String(r.idMovie);
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(r);
    }

    return grouped;
  }

  deleteReview(review: Review): void {
    const ok = confirm(
      `¿Seguro que querés eliminar la reseña del usuario ${
        review.userName ?? review.idProfile
      } sobre la película ${review.movieName ?? review.idMovie}?`
    );
    if (!ok) return;

    if (!review.id) {
      console.error('La reseña no tiene id, no se puede borrar');
      return;
    }

    this.reviewService.deleteReviewById(review.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== review.id);
        this.groupedReviews = this.groupByMovie(this.reviews);
        this.applyFilters();
      },
      error: () => {
        alert('No se pudo eliminar la reseña.');
      }
    });
  }

  // ================= FILTROS (BÚSQUEDA) =================

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

    // filtrar reseñas planas
    const filtered = this.reviews.filter(r => {
      const userName = (r.userName ?? '').toLowerCase();
      const movieName = (r.movieName ?? '').toLowerCase();

      const userOk = !userTerm || userName.includes(userTerm);
      const movieOk = !movieTerm || movieName.includes(movieTerm);

      return userOk && movieOk;
    });

    this.filteredGroupedReviews = this.groupByMovie(filtered);
  }
}
