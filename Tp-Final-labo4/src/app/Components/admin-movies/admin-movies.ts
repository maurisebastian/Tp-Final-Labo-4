import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AdminMoviesService } from '../../Services/movies.service';
import { AdminMovie } from '../../Interfaces/admin-movies';
import { AuthService } from '../../auth/auth-service';
import { TmdbService } from '../../Services/tmdb.service';
import { ReviewService } from '../../Services/review.service';
import { Review } from '../../Interfaces/profilein';
import { HiddenMoviesService, HiddenMovie } from '../../Services/hidden-movies.service';


@Component({
  selector: 'app-admin-movies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-movies.html',
  styleUrl: './admin-movies.css',
})
export class AdminMoviesComponent implements OnInit {

  private moviesService = inject(AdminMoviesService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private tmdb = inject(TmdbService);
  private reviewService = inject(ReviewService);
  private hiddenMoviesService = inject(HiddenMoviesService);

  // Películas locales
  movies: AdminMovie[] = [];
  isLoading = false;
  errorMsg = '';


  hiddenMoviesSignal = this.hiddenMoviesService.hiddenMovies;

  get hasNoHiddenMovies(): boolean {
    return this.hiddenMoviesSignal().length === 0;
  }

  unhideTmdbMovie(movie: HiddenMovie): void {
    this.hiddenMoviesService.unhideMovie(movie.tmdbId);
  }

  // Form para crear películas locales
  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    tmdbId: [''],
    posterPath: [''],
    overview: [''],
  });

  // ===== BUSCADOR TMDB =====
  searchControl = new FormControl<string>('');
  searchResults: any[] = [];
  searchPerformed = false;

  // ===== POPULARES (más reseñas) =====
  popularMovies: {
    idMovie: number;
    title: string;
    reviewCount: number;
    posterPath?: string | null;
  }[] = [];
  popularIsLoading = false;

  ngOnInit(): void {
    const active = this.authService.getActiveUser()();
    if (!active || (active.role !== 'admin' && active.role !== 'superadmin')) {
      this.router.navigate(['/']);
      return;
    }

    this.loadMovies();
    this.loadPopularMovies();
  }

  // ========== PELÍCULAS LOCALES ==========

  loadMovies(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.moviesService.getAll().subscribe({
      next: (list) => {
        this.movies = list;
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'No se pudieron cargar las películas.';
        this.isLoading = false;
      },
    });
  }

  submit(event: Event): void {
    event.preventDefault();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const newMovie: AdminMovie = {
      title: raw.title.trim(),
      overview: raw.overview?.trim() || '',
      posterPath: raw.posterPath?.trim() || '',
      isHidden: false,
      tmdbId: raw.tmdbId ? Number(raw.tmdbId) : undefined,
      // futuro: genresIds, castIds, etc.
    };

    this.moviesService.create(newMovie).subscribe({
      next: (saved) => {
        this.movies.push(saved);
        this.form.reset();
      },
      error: () => {
        alert('No se pudo crear la película.');
      },
    });
  }

  delete(movie: AdminMovie): void {
    if (!movie.id) return;

    const ok = confirm(`¿Seguro que querés eliminar "${movie.title}"?`);
    if (!ok) return;

    this.moviesService.delete(movie.id).subscribe({
      next: () => {
        this.movies = this.movies.filter((m) => m.id !== movie.id);
      },
      error: () => {
        alert('No se pudo eliminar la película.');
      },
    });
  }

  toggleHidden(movie: AdminMovie): void {
    if (!movie.id) return;

    // si la película está visible -> la vamos a ocultar
    if (!movie.isHidden) {
      const reason = window.prompt(
        `¿Por qué querés ocultar "${movie.title}"?`
      );

      // si canceló o no escribió nada, no hacemos nada
      if (!reason || !reason.trim()) {
        return;
      }

      const payload: Partial<AdminMovie> = {
        isHidden: true,
        hiddenReason: reason.trim(),
      };

      this.moviesService.update(movie.id, payload).subscribe({
        next: (updated) => {
          movie.isHidden = updated.isHidden;
          movie.hiddenReason = updated.hiddenReason;
        },
        error: () => {
          alert('No se pudo actualizar el estado de la película.');
        },
      });
    } else {
      // si ya estaba oculta -> la mostramos de nuevo y limpiamos el motivo
      const payload: Partial<AdminMovie> = {
        isHidden: false,
        hiddenReason: '',
      };

      this.moviesService.update(movie.id, payload).subscribe({
        next: (updated) => {
          movie.isHidden = updated.isHidden;
          movie.hiddenReason = updated.hiddenReason;
        },
        error: () => {
          alert('No se pudo actualizar el estado de la película.');
        },
      });
    }
  }


  goToMovie(movie: AdminMovie): void {
  // Si tiene TMDB → usamos ese ID
  // Si es solo local → usamos el id de la película local
  const id = movie.tmdbId ?? movie.id;
  if (!id) return;

  this.router.navigate(['/movie-review', id]);
}


  // ========== BUSCADOR TMDB POR NOMBRE ==========

  search(event: Event): void {
    event.preventDefault();

    const query = (this.searchControl.value || '').trim();
    if (!query) {
      this.searchResults = [];
      this.searchPerformed = false;
      return;
    }

    this.tmdb.searchMovies(query).subscribe({
      next: (resp: any) => {
        this.searchResults = resp.results || [];
        this.searchPerformed = true;
      },
      error: () => {
        this.searchResults = [];
        this.searchPerformed = true;
      },
    });
  }

  goToMovieId(id: number): void {
    this.router.navigate(['/movie-review', id]);
  }


  // ========== POPULARES (MÁS RESEÑAS) ==========

  // ========== POPULARES (MÁS RESEÑAS) ==========
private loadPopularMovies(): void {
  this.popularIsLoading = true;

  this.reviewService.getAllReviews().subscribe({
    next: (reviews: Review[]) => {
      if (!reviews || reviews.length === 0) {
        this.popularMovies = [];
        this.popularIsLoading = false;
        return;
      }

      // agrupar por idMovie y contar reseñas (solo TMDB numéricos)
      const mapCounts = new Map<number, number>();

      for (const r of reviews) {
        // ignorar reseñas sin idMovie
        if (r.idMovie == null) continue;

        const numId = Number(r.idMovie);

        // 👇 IGNORAR pelis locales (id string) y cualquier cosa rara
        if (Number.isNaN(numId)) continue;

        mapCounts.set(numId, (mapCounts.get(numId) || 0) + 1);
      }

      const ids = Array.from(mapCounts.keys());

      if (ids.length === 0) {
        this.popularMovies = [];
        this.popularIsLoading = false;
        return;
      }

      // levantar detalles + poster para cada TMDB
      const temp: {
        idMovie: number;
        title: string;
        reviewCount: number;
        posterPath?: string | null;
      }[] = [];

      let pending = ids.length;

      ids.forEach((idMovie) => {
        this.tmdb.getMovieDetails(idMovie).subscribe({
          next: (movie: any) => {
            temp.push({
              idMovie,
              title: movie.title || `ID ${idMovie}`,
              reviewCount: mapCounts.get(idMovie) || 0,
              posterPath: movie.poster_path,
            });
            pending--;
            if (pending === 0) {
              this.popularMovies = temp.sort(
                (a, b) => b.reviewCount - a.reviewCount
              );
              this.popularIsLoading = false;
            }
          },
          error: () => {
            temp.push({
              idMovie,
              title: `ID ${idMovie}`,
              reviewCount: mapCounts.get(idMovie) || 0,
            });
            pending--;
            if (pending === 0) {
              this.popularMovies = temp.sort(
                (a, b) => b.reviewCount - a.reviewCount
              );
              this.popularIsLoading = false;
            }
          },
        });
      });
    },
    error: () => {
      this.popularMovies = [];
      this.popularIsLoading = false;
    },
  });
}


  editMovie(movie: AdminMovie): void {
  if (!movie.id) return;
  this.router.navigate(['/admin/local-movie', movie.id]);
}

}
