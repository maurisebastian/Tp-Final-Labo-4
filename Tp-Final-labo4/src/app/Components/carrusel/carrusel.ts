import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TmdbService } from '../../Services/tmdb.service';
import { AuthService } from '../../auth/auth-service';
import { Moviein } from '../../Interfaces/moviein';
import { Profile } from '../../Interfaces/profilein';
import { HiddenMoviesService } from '../../Services/hidden-movies.service';

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './carrusel.html',
  styleUrls: ['./carrusel.css'],
})
export class Carrusel implements OnInit, OnDestroy {

  private readonly tmdbService = inject(TmdbService);
  private readonly authService = inject(AuthService);
  private readonly hiddenMoviesService = inject(HiddenMoviesService);

  topRatedMovies: Moviein[] = [];
  recommendedMovies: Moviein[] = [];
  hasRecommendations = false;

  currentSlideIndex = 0;
  maxVisibleMovies = 5;

  autoSlideInterval: any = null;
  slideDelayMs = 1800;

  // ⭐👉 ESTA PROPIEDAD FALTABA
  hiddenTmdbIds: number[] = [];

  ngOnInit(): void {
    // Cargar lista de IDs ocultos desde el servicio
    const hiddenList = this.hiddenMoviesService.hiddenMovies();
    this.hiddenTmdbIds = hiddenList.map(m => Number(m.tmdbId));

    this.loadTopRatedMovies();
    this.startAutoSlide();
    this.loadRecommendations();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  private isBrowser(): boolean {
    return typeof document !== 'undefined';
  }

  private isHidden(id: number | string | undefined | null): boolean {
    if (id === undefined || id === null) return false;
    const num = typeof id === 'string' ? Number(id) : id;
    return this.hiddenTmdbIds.includes(num);
  }

  startAutoSlide(): void {
    if (!this.isBrowser()) return;

    this.stopAutoSlide();

    this.autoSlideInterval = setInterval(() => {
      const maxIndex = this.topRatedMovies.length - this.maxVisibleMovies;

      if (this.topRatedMovies.length === 0) return;

      if (this.currentSlideIndex < maxIndex) {
        this.nextSlide();
      } else {
        this.currentSlideIndex = 0;
        this.updateCarousel();
      }
    }, this.slideDelayMs);
  }

  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  pauseAutoSlide(): void {
    this.stopAutoSlide();
  }

  resumeAutoSlide(): void {
    this.startAutoSlide();
  }

  loadTopRatedMovies(): void {
    this.tmdbService.getTopRatedMovies().subscribe({
      next: (response) => {
        const all = response.results ?? [];

        // Filtrar películas ocultas
        const visibles = all.filter((m: Moviein) => !this.isHidden(m.id));


        this.topRatedMovies = visibles.slice(0, 10);
        this.currentSlideIndex = 0;
        this.updateCarousel();
      },
      error: () => console.error('Error al obtener top rated'),
    });
  }

  private loadRecommendations(): void {
    const activeSignal = this.authService.getActiveUser();
    const active: Profile | undefined = activeSignal();

    const genres = active?.favoriteGenres ?? [];
    if (!genres.length) {
      this.hasRecommendations = false;
      return;
    }

    const mainGenres = genres.slice(0, 3);

    this.tmdbService.getMoviesByGenres(mainGenres).subscribe({
      next: (response) => {
        const movies = response.results ?? [];

        const topIds = new Set(this.topRatedMovies.map(m => m.id));

        this.recommendedMovies = movies
          .filter((m: Moviein) =>
            !topIds.has(m.id) &&       // no repetir con top rated
            !this.isHidden(m.id)       // no mostrar si está oculta
          )
          .slice(0, 12);

        this.hasRecommendations = this.recommendedMovies.length > 0;
      },
      error: () => {
        this.hasRecommendations = false;
      },
    });
  }

  prevSlide(): void {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.updateCarousel();
    }
  }

  nextSlide(): void {
    const maxIndex = this.topRatedMovies.length - this.maxVisibleMovies;

    if (this.currentSlideIndex < maxIndex) {
      this.currentSlideIndex++;
      this.updateCarousel();
    }
  }

  updateCarousel(): void {
    if (!this.isBrowser()) return;

    const movieList = document.querySelector('.movie-list') as HTMLElement;
    if (!movieList) return;

    const firstItem = movieList.querySelector('.movie-item') as HTMLElement;
    if (!firstItem) return;

    const itemWidth = firstItem.offsetWidth || 180;
    const styles = getComputedStyle(movieList);

    const gap = Number((styles.gap || '0').replace('px', '')) || 0;
    const move = this.currentSlideIndex * (itemWidth + gap);

    movieList.style.transform = `translateX(-${move}px)`;
  }

  isNextButtonDisabled(): boolean {
    return this.currentSlideIndex >= this.topRatedMovies.length - this.maxVisibleMovies;
  }
}
