import { Component, inject, OnInit } from '@angular/core';
import { TmdbService } from '../../Services/tmdb.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Footer } from '../../Shared/footer/footer';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-movie-search',
  standalone: true,
  imports: [RouterLink, Footer, ReactiveFormsModule],
  templateUrl: './movie-search.html',
  styleUrl: './movie-search.css',
})
export class MovieSearch implements OnInit {

  private movieService = inject(TmdbService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  busqueda = new FormControl('', Validators.required);
  resultados: any[] = [];

  ngOnInit(): void {
    // 👉 Escuchamos SIEMPRE los cambios del parámetro :query
    this.route.paramMap.subscribe(params => {
      const query = params.get('query') ?? '';

      // mostrar el query actual en el input
      this.busqueda.setValue(query);

      if (query.trim() !== '') {
        this.buscarPorQuery(query);
      } else {
        this.resultados = [];
      }
    });
  }

  // Se ejecuta cuando apretás Enter o el botón "Buscar"
  onSubmit(event: Event) {
    event.preventDefault();   // evita recarga de página
    this.buscar();
  }

  buscar() {
    const query = (this.busqueda.value ?? '').trim();

    if (!query) {
      this.busqueda.markAsTouched();
      return;
    }

    // 👉 SOLO navegamos; la búsqueda la hace el subscribe de arriba
    this.router.navigate(['/search', query]);
  }

  private buscarPorQuery(query: string) {
    this.movieService.searchMovies(query)
      .subscribe(response => {
        this.resultados = response['results'] ?? [];
        console.log('Buscando:', query, this.resultados);
      });
  }
}
