import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AdminMoviesService } from '../../Services/movies-service';
import { AdminMovie } from '../../Interfaces/admin-movies';
import { AuthService } from '../../auth/auth-service';

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

  movies: AdminMovie[] = [];
  isLoading = false;
  errorMsg = '';

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    tmdbId: [''],
    posterPath: [''],
    overview: [''],
  });

  ngOnInit(): void {
    const active = this.authService.getActiveUser()();
    if (!active || (active.role !== 'admin' && active.role !== 'superadmin')) {
      this.router.navigate(['/']);
      return;
    }

    this.loadMovies();
  }

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

    const newValue = !movie.isHidden;
    this.moviesService.update(movie.id, { isHidden: newValue }).subscribe({
      next: (updated) => {
        movie.isHidden = updated.isHidden;
      },
      error: () => {
        alert('No se pudo actualizar el estado de la película.');
      },
    });
  }

  goToMovie(movie: AdminMovie): void {
    if (!movie.tmdbId) return;
    this.router.navigate(['/movie', movie.tmdbId]);
  }
}
