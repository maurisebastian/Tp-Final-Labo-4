// src/app/Components/movie-search/movie-search.ts
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Footer } from '../../Shared/footer/footer';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

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

  busqueda = new FormControl('', Validators.required);
  resultados: SearchMovie[] = [];

  ngOnInit(): void {
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
          this.resultados = movies;
          console.log('Buscando:', query, this.resultados);
        },
        error: (err) => {
          console.error('Error en búsqueda:', err);
          this.resultados = [];
        }
      });
  }
}
