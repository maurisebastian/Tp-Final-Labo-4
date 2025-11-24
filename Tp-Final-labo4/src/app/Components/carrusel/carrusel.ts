import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TmdbService } from '../../Services/tmdb.service';
import { AuthService } from '../../auth/auth-service';
import { Moviein } from '../../Interfaces/moviein';
import { Profile } from '../../Interfaces/profilein';
import { HiddenMoviesService } from '../../Services/hidden-movies.service';

// ⭐ NUEVO
import { forkJoin } from 'rxjs';

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

  // -------- TOP RATED --------
  currentSlideIndex = 0;
  maxVisibleMovies = 5;
  autoSlideInterval: any = null;
  slideDelayMs = 1800;

  // -------- RECOMENDADAS (GÉNEROS) --------
  recommendedSlideIndex = 0;
  recommendedMaxVisible = 5;
  recommendedTranslateX = 0;
  recommendedAutoSlideInterval: any = null;
  recommendedSlideDelayMs = 4000;

  // ⭐ NUEVO: PELÍCULAS POR ACTORES FAVORITOS
  actorBasedMovies: Moviein[] = [];
  actorSlideIndex = 0;
  actorMaxVisible = 5;
  actorTranslateX = 0;

  // IDs ocultos
  hiddenTmdbIds: number[] = [];

  ngOnInit(): void {
    const hiddenList = this.hiddenMoviesService.hiddenMovies();
    this.hiddenTmdbIds = hiddenList.map(m => Number(m.tmdbId));

    this.loadTopRatedMovies();
    this.startAutoSlide();

    this.loadRecommendations();     // por géneros
    this.loadActorBasedMovies();    // ⭐ NUEVO: por actores

  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
    this.stopRecommendedAutoSlide();
  }

  private isBrowser(): boolean {
    return typeof document !== 'undefined';
  }

  private isHidden(id: number | string | undefined | null): boolean {
    if (id === undefined || id === null) return false;
    const num = typeof id === 'string' ? Number(id) : id;
    return this.hiddenTmdbIds.includes(num);
  }

  // ==========================
  //       TOP RATED
  // ==========================

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
        const visibles = all.filter((m: Moviein) => !this.isHidden(m.id));

        this.topRatedMovies = visibles.slice(0, 10);
        this.currentSlideIndex = 0;
        this.updateCarousel();
      },
      error: () => console.error('Error al obtener top rated'),
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

    let movieList = document.querySelector('.top-list') as HTMLElement | null;
    if (!movieList) {
      movieList = document.querySelector('.movie-list') as HTMLElement | null;
    }
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

  // ==========================
  //     RECOMENDADAS (GÉNEROS)
  // ==========================

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
            !topIds.has(m.id) && !this.isHidden(m.id)
          )
          .slice(0, 12);

        this.hasRecommendations = this.recommendedMovies.length > 0;

        this.recommendedSlideIndex = 0;
        this.updateRecommendedCarousel();
        this.startRecommendedAutoSlide();
      },
      error: () => {
        this.hasRecommendations = false;
      },
    });
  }

  startRecommendedAutoSlide(): void {
    if (!this.isBrowser() || !this.hasRecommendations) return;

    this.stopRecommendedAutoSlide();

    this.recommendedAutoSlideInterval = setInterval(() => {
      const maxIndex = this.recommendedMovies.length - this.recommendedMaxVisible;

      if (this.recommendedMovies.length === 0) return;

      if (this.recommendedSlideIndex < maxIndex) {
        this.nextRecommendedSlide();
      } else {
        this.recommendedSlideIndex = 0;
        this.updateRecommendedCarousel();
      }
    }, this.recommendedSlideDelayMs);
  }

  stopRecommendedAutoSlide(): void {
    if (this.recommendedAutoSlideInterval) {
      clearInterval(this.recommendedAutoSlideInterval);
      this.recommendedAutoSlideInterval = null;
    }
  }

  pauseRecommendedAutoSlide(): void {
    this.stopRecommendedAutoSlide();
  }

  resumeRecommendedAutoSlide(): void {
    this.startRecommendedAutoSlide();
  }

  prevRecommendedSlide(): void {
    if (this.recommendedSlideIndex > 0) {
      this.recommendedSlideIndex--;
      this.updateRecommendedCarousel();
    }
  }

  nextRecommendedSlide(): void {
    const maxIndex = this.recommendedMovies.length - this.recommendedMaxVisible;

    if (this.recommendedSlideIndex < maxIndex) {
      this.recommendedSlideIndex++;
      this.updateRecommendedCarousel();
    }
  }

  updateRecommendedCarousel(): void {
    if (!this.isBrowser()) return;

    const movieList = document.querySelector('.recommended-list') as HTMLElement;
    if (!movieList) return;

    const firstItem = movieList.querySelector('.movie-item') as HTMLElement;
    if (!firstItem) return;

    const itemWidth = firstItem.offsetWidth || 180;
    const styles = getComputedStyle(movieList);
    const gap = Number((styles.gap || '0').replace('px', '')) || 0;

    const move = this.recommendedSlideIndex * (itemWidth + gap);
    this.recommendedTranslateX = -move;
    movieList.style.transform = `translateX(${this.recommendedTranslateX}px)`;
  }

  isRecommendedNextButtonDisabled(): boolean {
    return (
      this.recommendedSlideIndex >=
      this.recommendedMovies.length - this.recommendedMaxVisible
    );
  }

  // ==========================
  //   ⭐ NUEVO: PELIS POR ACTORES
  // ==========================

  private loadActorBasedMovies(): void {

    const activeSignal = this.authService.getActiveUser();
    const active: Profile | undefined = activeSignal();

    const actorIds = active?.favoriteActors ?? [];
    if (!actorIds.length) {
      this.actorBasedMovies = [];
      return;
    }

    const mainActors = actorIds.slice(0, 3); // ej: primeros 3 elegidos

    const requests = mainActors.map(id => this.tmdbService.getMoviesByActor(id));

    forkJoin(requests).subscribe({
      next: (responses: any[]) => {
        // TMDB /person/{id}/movie_credits suele devolver { cast: Movie[] }
        let allMovies: Moviein[] = [];

        responses.forEach(resp => {
          const list = (resp.cast ?? resp.results ?? []) as Moviein[];
          allMovies = allMovies.concat(list);
        });
        console.log("RESPUESTAS ACTORES:", responses);
        console.log("PELÍCULAS RESULTANTES:", allMovies);

        // Sacar duplicados por id
        const uniqueMap = new Map<number, Moviein>();
        allMovies.forEach(m => {
          if (m && m.id != null && !uniqueMap.has(m.id)) {
            uniqueMap.set(m.id, m);
          }
        });

        // Filtrar ocultas
        const filtered = Array.from(uniqueMap.values()).filter(
          (m: Moviein) => !this.isHidden(m.id)
        );

        // Tomamos unas cuantas random
        this.actorBasedMovies = filtered
          .sort(() => Math.random() - 0.5)
          .slice(0, 15);

        this.actorSlideIndex = 0;
        this.updateActorCarousel();
      },
      error: () => {
        this.actorBasedMovies = [];

        console.log("CANTIDAD FINAL:", this.actorBasedMovies.length);

      },
    });

  }

  prevActorSlide(): void {
    if (this.actorSlideIndex > 0) {
      this.actorSlideIndex--;
      this.updateActorCarousel();
    }
  }

  nextActorSlide(): void {
    const maxIndex = this.actorBasedMovies.length - this.actorMaxVisible;

    if (this.actorSlideIndex < maxIndex) {
      this.actorSlideIndex++;
      this.updateActorCarousel();
    }
  }

  updateActorCarousel(): void {
    if (!this.isBrowser()) return;

    const movieList = document.querySelector('.actor-list') as HTMLElement;
    if (!movieList) return;

    const firstItem = movieList.querySelector('.movie-item') as HTMLElement;
    if (!firstItem) return;

    const itemWidth = firstItem.offsetWidth || 180;
    const styles = getComputedStyle(movieList);
    const gap = Number((styles.gap || '0').replace('px', '')) || 0;

    const move = this.actorSlideIndex * (itemWidth + gap);
    this.actorTranslateX = -move;
    movieList.style.transform = `translateX(${this.actorTranslateX}px)`;
  }

  isActorNextButtonDisabled(): boolean {
    return (
      this.actorSlideIndex >=
      this.actorBasedMovies.length - this.actorMaxVisible
    );
  }
}
