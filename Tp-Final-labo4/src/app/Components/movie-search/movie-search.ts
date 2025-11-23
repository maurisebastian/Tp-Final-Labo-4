// src/app/Components/movie-search/movie-search.ts
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Footer } from '../../Shared/footer/footer';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HiddenMoviesService } from '../../Services/hidden-movies.service';

import { MovieSearchService, SearchMovie } from '../../Services/movie-search.service';

@Component({
  selector: 'app-movie-search',
  standalone: true,
  imports: [RouterLink, Footer, ReactiveFormsModule],
  templateUrl: './movie-search.html',
  styleUrl: './movie-search.css',
})
export class MovieSearch implements OnInit {

  private movieSearchService = inject(MovieSearchService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private hiddenMoviesService = inject(HiddenMoviesService);

  busqueda = new FormControl('', Validators.required);
  resultados: SearchMovie[] = [];

  // ⭐ IDs ocultos (TMDB)
  hiddenTmdbIds: number[] = [];

  ngOnInit(): void {

    // ⭐ 1) Cargar IDs ocultos
    const hiddenList = this.hiddenMoviesService.hiddenMovies();
    this.hiddenTmdbIds = hiddenList.map(m => Number(m.tmdbId));

    // Escuchar la ruta /search/:query
    this.route.paramMap.subscribe(params => {
      const query = params.get('query') ?? '';

      this.busqueda.setValue(query);

      if (query.trim() !== '') {
        this.buscarPorQuery(query);
      } else {
        this.resultados = [];
      }
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.buscar();
  }

  buscar() {
    const query = (this.busqueda.value ?? '').trim();

    if (!query) {
      this.busqueda.markAsTouched();
      return;
    }

    this.router.navigate(['/search', query]);
  }

  private buscarPorQuery(query: string) {
    this.movieSearchService.searchAll(query)
      .subscribe({
        next: (movies) => {

          // ⭐ 2) Filtrar las películas ocultas
          this.resultados = movies.filter((m: SearchMovie) =>
            !this.hiddenTmdbIds.includes(Number(m.id))
          );

          console.log('Buscando:', query, this.resultados);
        },
        error: (err) => {
          console.error('Error en búsqueda:', err);
          this.resultados = [];
        }
      });
  }
}
