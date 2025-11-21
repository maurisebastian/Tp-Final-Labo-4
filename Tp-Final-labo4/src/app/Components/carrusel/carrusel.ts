import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TmdbService } from '../../Services/tmdb.service';
import { Moviein } from '../../Interfaces/moviein';
import { Footer } from '../../Shared/footer/footer';
import { TopBar } from '../top-bar/top-bar';

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [RouterModule, Footer, TopBar],
  templateUrl: './carrusel.html',
  styleUrls: ['./carrusel.css'],
})
export class Carrusel implements OnInit, OnDestroy {

  private readonly tmdbService = inject(TmdbService);

  topRatedMovies: Moviein[] = [];
  currentSlideIndex = 0;
  maxVisibleMovies = 5;

  autoSlideInterval: any = null;
  slideDelayMs = 1800; // 🔹 velocidad del auto-slide (1.8 segundos)


  // ---------------------------
  //   CICLO DE VIDA
  // ---------------------------
  ngOnInit(): void {
    this.loadTopRatedMovies();
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  // Helper para no romper en SSR
  private isBrowser(): boolean {
    return typeof document !== 'undefined';
  }

  // ---------------------------
  //       AUTO SLIDE
  // ---------------------------
  startAutoSlide(): void {
    if (!this.isBrowser()) return;

    this.stopAutoSlide();

    this.autoSlideInterval = setInterval(() => {
  const maxIndex = this.topRatedMovies.length - this.maxVisibleMovies;

  if (this.topRatedMovies.length === 0) {
    return;
  }

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

  // ---------------------------
  //     CARGA DE PELÍCULAS
  // ---------------------------
  loadTopRatedMovies(): void {
    this.tmdbService.getTopRatedMovies().subscribe(
      (response: any) => {
        if (response && response.results) {
          this.topRatedMovies = response.results.slice(0, 10);
          console.log('Películas cargadas:', this.topRatedMovies);

          // por las dudas, reseteo carrusel
          this.currentSlideIndex = 0;
          this.updateCarousel();
        }
      },
      (error) => console.error('Error al obtener las películas:', error)
    );
  }

  // ---------------------------
  //   NAVEGACIÓN MANUAL
  // ---------------------------
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

  // ---------------------------
  //     MOVER CARRUSEL
  // ---------------------------
  updateCarousel(): void {
    if (!this.isBrowser()) return;

    const movieList = document.querySelector('.movie-list') as HTMLElement | null;
    if (!movieList) return;

    const firstItem = movieList.querySelector('.movie-item') as HTMLElement | null;
    if (!firstItem) return;

    const itemWidth = firstItem.offsetWidth || 180;
    const styles = getComputedStyle(movieList);
    const gapStr = (styles.columnGap || styles.gap || '0').replace('px', '');
    const gap = Number(gapStr) || 0;

    const move = this.currentSlideIndex * (itemWidth + gap);
    movieList.style.transform = `translateX(-${move}px)`;
  }

  isNextButtonDisabled(): boolean {
    return this.currentSlideIndex >=
      this.topRatedMovies.length - this.maxVisibleMovies;
  }
}
