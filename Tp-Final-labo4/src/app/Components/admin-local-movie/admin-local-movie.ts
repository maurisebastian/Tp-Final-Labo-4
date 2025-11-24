import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminMoviesService } from '../../Services/movies.service';
import { AdminMovie } from '../../Interfaces/admin-movies';

@Component({
  selector: 'app-admin-local-movie',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './admin-local-movie.html',
  styleUrl: './admin-local-movie.css',
})
export class AdminLocalMovieComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private moviesService = inject(AdminMoviesService);
  private fb = inject(FormBuilder);

  movie: AdminMovie | null = null;
  isLoading = true;
  errorMsg = '';

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    overview: [''],
    posterPath: [''],
    tmdbId: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMsg = 'Película no encontrada.';
      this.isLoading = false;
      return;
    }

    this.moviesService.getById(id).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.isLoading = false;

        this.form.patchValue({
          title: movie.title ?? '',
          overview: movie.overview ?? '',
          posterPath: movie.posterPath ?? '',
          tmdbId: movie.tmdbId ? String(movie.tmdbId) : '',
        });
      },
      error: () => {
        this.errorMsg = 'No se pudo cargar la película.';
        this.isLoading = false;
      },
    });
  }

  save(event: Event): void {
    event.preventDefault();

    if (!this.movie?.id || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const payload: Partial<AdminMovie> = {
      title: raw.title.trim(),
      overview: raw.overview?.trim() || '',
      posterPath: raw.posterPath?.trim() || '',
      tmdbId: raw.tmdbId ? Number(raw.tmdbId) : undefined,
    };

    this.moviesService.update(this.movie.id, payload).subscribe({
      next: (updated) => {
        this.movie = { ...this.movie!, ...updated };
        alert('Película actualizada');
      },
      error: () => {
        alert('No se pudo actualizar la película');
      },
    });
  }
}
