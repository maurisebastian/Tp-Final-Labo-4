import { Component, inject, OnInit } from '@angular/core';
import { TmdbService } from '../../Services/tmdb.service';
import { Moviein } from '../../Interfaces/moviein';
import { Footer } from "../../Shared/footer/footer";
import { TopBar } from "../top-bar/top-bar";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-carrusel',
  imports: [RouterModule, Footer, TopBar],
  templateUrl: './carrusel.html',
  styleUrl: './carrusel.css',
})
export class Carrusel implements OnInit {

  private readonly tmdbService = inject(TmdbService);
  
  topRatedMovies: Moviein[] = [];
  currentSlideIndex: number = 0;

  // Cantidad de películas que se ven completas en el carrusel
  maxVisibleMovies: number = 5;

  ngOnInit() {
    this.loadTopRatedMovies();
  }

  loadTopRatedMovies() {
    this.tmdbService.getTopRatedMovies().subscribe(
      (response: any) => {
        if (response && response.results) {
          // Solo usamos las primeras 10
          this.topRatedMovies = response.results.slice(0, 10);
          console.log('Películas cargadas:', this.topRatedMovies);
        }
      },
      (error) => {
        console.error('Error al obtener las películas:', error);
      }
    );
  }

  prevSlide() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.updateCarousel();
    }
  }

  nextSlide() {
    const maxIndex = this.topRatedMovies.length - this.maxVisibleMovies;
    if (this.currentSlideIndex < maxIndex) {
      this.currentSlideIndex++;
      this.updateCarousel();
    }
  }

  // Calcula cuánto hay que mover el carrusel según el ancho REAL de la card + gap
  updateCarousel() {
    const movieList = document.querySelector('.movie-list') as HTMLElement | null;
    if (!movieList) return;

    const firstItem = movieList.querySelector('.movie-item') as HTMLElement | null;
    if (!firstItem) return;

    const itemWidth = firstItem.offsetWidth; // 180px en tu CSS
    const styles = getComputedStyle(movieList);

    // Para flex con gap se usa columnGap / gap
    const gapStr = (styles.columnGap || styles.gap || '0').replace('px', '');
    const gap = Number(gapStr) || 0; // 25px en tu CSS

    const move = this.currentSlideIndex * (itemWidth + gap);
    movieList.style.transform = `translateX(-${move}px)`;
  }

  isNextButtonDisabled(): boolean {
    return this.currentSlideIndex >= this.topRatedMovies.length - this.maxVisibleMovies;
  }
}
