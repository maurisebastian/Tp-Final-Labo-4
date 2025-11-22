import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../auth/auth-service';
import { TopBar } from '../top-bar/top-bar';
import { Footer } from '../../Shared/footer/footer';
import { Carrusel } from '../carrusel/carrusel';
import { TmdbService } from '../../Services/tmdb.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TopBar, Footer, Carrusel],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly tmdbService = inject(TmdbService);

  activeUserSignal = this.authService.getActiveUser();

  // ⭐ Carrusel A: Más puntuadas
  topRatedMovies: any[] = [];

  // ⭐ Carrusel B: Recomendaciones por géneros
  recommendedMovies: any[] = [];

  // ⭐ Carrusel C: Populares por géneros
  popularByGenres: any[] = [];

  ngOnInit(): void {
    const user = this.activeUserSignal();

    // Si es admin → lo manda al dashboard
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      this.router.navigate(['/admin']);
      return;
    }

    // ============================
    // ⭐ CARRUSEL A - MÁS PUNTUADAS
    // ============================
    this.tmdbService.getTopRatedMovies().subscribe({
      next: (response) => {
        this.topRatedMovies = response.results?.slice(0, 10) ?? [];
      },
      error: (err) => console.error('Error cargando Top Rated:', err),
    });

    // =============================================
    // ⭐ SI EL USUARIO YA ELIGIÓ GÉNEROS FAVORITOS
    // =============================================
    if (user && user.favoriteGenres && user.favoriteGenres.length > 0) {

      const genres = user.favoriteGenres.slice(0, 3);

      // ====================================================
      // ⭐ CARRUSEL B - RECOMENDADAS (ordenadas por puntuación)
      // ====================================================
      this.tmdbService.getMoviesByGenres(genres).subscribe({
        next: (response) => {
          this.recommendedMovies = response.results.slice(0, 12);
        },
        error: (err) =>
          console.error('Error cargando recomendaciones:', err),
      });

      // ====================================================
      // 🔥 CARRUSEL C - POPULARES POR TUS GÉNEROS
      // ====================================================
      this.tmdbService.getPopularByGenres(genres).subscribe({
        next: (response) => {
          this.popularByGenres = response.results.slice(0, 12);
        },
        error: () => console.error('Error cargando populares por género'),
      });
    }
  }
}
