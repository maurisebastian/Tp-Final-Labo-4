// src/app/Components/genres/genres.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TmdbService } from '../../Services/tmdb.service';
import { ProfileService } from '../../Services/profile.service';
import { AuthService } from '../../auth/auth-service';
import { Moviein } from '../../Interfaces/moviein';
import { TopBar } from '../top-bar/top-bar';
import { Footer } from '../../Shared/footer/footer';
import { Profile } from '../../Interfaces/profilein';

@Component({
  selector: 'app-genres',
  standalone: true,
  imports: [CommonModule, TopBar, Footer],
  templateUrl: './genres.html',
  styleUrls: ['./genres.css'],
})
export class Genres implements OnInit {

  private readonly tmdbService = inject(TmdbService);
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  movies: Moviein[] = [];
  selectedMovieIds = new Set<number>();

  isSaving = false;
  errorMsg = '';

  ngOnInit(): void {
  this.loadRandomMovies(); // primer carga
}


  // 🔹 Cargar películas y ACUMULAR (no borramos las anteriores)
  // 🔹 Cargar películas
//   - si keepSelected = false → carga una tanda nueva
//   - si keepSelected = true  → mantiene las seleccionadas y reemplaza el resto
loadRandomMovies(keepSelected: boolean = false): void {
  this.tmdbService.getRandomMovies().subscribe({
    next: (response: any) => {
      const movies: Moviein[] = response.results ?? [];

      if (!keepSelected) {
        // primera carga o refresh total
        this.movies = movies;
        return;
      }

      // mantener las ya elegidas
      const selectedMovies = this.movies.filter(m =>
        this.selectedMovieIds.has(m.id)
      );
      const selectedIds = new Set(selectedMovies.map(m => m.id));

      // nuevas pelis que no estén seleccionadas
      const newOnes = movies.filter(m => !selectedIds.has(m.id));

      // mezclamos: primero las elegidas, luego las nuevas
      this.movies = [...selectedMovies, ...newOnes];
    },
    error: () => {
      this.errorMsg = 'No se pudieron cargar más películas.';
    },
  });
}




  // Seleccionar / deseleccionar una película
  toggleMovie(movie: Moviein): void {
    if (this.selectedMovieIds.has(movie.id)) {
      this.selectedMovieIds.delete(movie.id);
    } else {
      this.selectedMovieIds.add(movie.id);
    }
  }

  isSelected(movie: Moviein): boolean {
    return this.selectedMovieIds.has(movie.id);
  }

  savePreferences(): void {
    this.errorMsg = '';

    if (this.selectedMovieIds.size === 0) {
      this.errorMsg = 'Elegí al menos una película.';
      return;
    }

    const activeSignal = this.authService.getActiveUser();
    const active = activeSignal();

    if (!active) {
      this.router.navigate(['/login']);
      return;
    }

    const selectedMovies = this.movies.filter((m: Moviein) =>
      this.selectedMovieIds.has(m.id)
    );

    const genreSet = new Set<number>();
    for (const m of selectedMovies) {
      (m.genres || []).forEach((g: { id: number }) => genreSet.add(g.id));
    }

    const favoriteGenres = Array.from(genreSet);

    const updatedUser: Profile = {
      ...active,
      favoriteGenres,
    };

    this.isSaving = true;

    this.profileService.updateProfile(updatedUser).subscribe({
      next: (ok: boolean) => {
        this.isSaving = false;
        if (ok) {
          activeSignal.set(updatedUser);
          this.router.navigate(['/']);
        } else {
          this.errorMsg = 'No se pudieron guardar las preferencias.';
        }
      },
      error: () => {
        this.isSaving = false;
        this.errorMsg = 'No se pudieron guardar las preferencias.';
      },
    });
  }
}
