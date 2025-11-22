import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TmdbService } from '../../Services/tmdb.service';
import { Moviein } from '../../Interfaces/moviein';

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './carrusel.html',
  styleUrls: ['./carrusel.css'],
})
export class Carrusel implements OnInit, OnDestroy {

  /** Películas recibidas desde Home (opcional) */
  @Input() movies: Moviein[] = [];

  /** Lista final del carrusel */
  items: Moviein[] = [];

  currentSlideIndex = 0;
  maxVisibleMovies = 5;

  autoSlideInterval: any = null;
  slideDelayMs = 1800;

  private readonly tmdbService = inject(TmdbService);

  ngOnInit(): void {

    // Si Home envía películas → usarlas
    if (this.movies && this.movies.length > 0) {
      this.items = [...this.movies];
      this.updateCarousel();
    } 
    else {
      // Sino → cargar top rated
      this.loadTopRatedMovies();
    }

    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  private isBrowser(): boolean {
    return typeof document !== 'undefined';
  }

  /** Carga Top Rated si no llegan películas */
  loadTopRatedMovies(): void {
    this.tmdbService.getTopRatedMovies().subscribe({
      next: (response) => {
        this.items = response.results?.slice(0, 10) ?? [];
        this.currentSlideIndex = 0;
        this.updateCarousel();
      },
      error: () => console.error('Error al obtener películas top rated')
    });
  }

  startAutoSlide(): void {
    if (!this.isBrowser()) return;

    this.stopAutoSlide();

    this.autoSlideInterval = setInterval(() => {
      const maxIndex = this.items.length - this.maxVisibleMovies;

      if (this.items.length === 0) return;

      if (this.currentSlideIndex < maxIndex) {
        this.nextSlide();
      } 
      else {
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

  /** Navegación manual */
  prevSlide(): void {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.updateCarousel();
    }
  }

  nextSlide(): void {
    const maxIndex = this.items.length - this.maxVisibleMovies;

    if (this.currentSlideIndex < maxIndex) {
      this.currentSlideIndex++;
      this.updateCarousel();
    }
  }

  /** Mover carrusel */
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

  /** Deshabilitar flecha derecha */
  isNextButtonDisabled(): boolean {
    return this.currentSlideIndex >= this.items.length - this.maxVisibleMovies;
  }
}
