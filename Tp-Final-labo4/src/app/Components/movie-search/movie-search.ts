import { Component, inject, OnInit } from '@angular/core';
import { TmdbService } from '../../Services/tmdb.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Footer } from '../../Shared/footer/footer';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-movie-search',
  imports: [RouterLink, Footer, ReactiveFormsModule],
  templateUrl: './movie-search.html',
  styleUrl: './movie-search.css',
})
export class MovieSearch implements OnInit {

  private movieService = inject(TmdbService);
  private route = inject(ActivatedRoute);

  busqueda = new FormControl("",Validators.required);
  resultados: any;



   ngOnInit(): void {
    const query = this.route.snapshot.paramMap.get('query') ?? "";

    this.busqueda.setValue(query);

    if (query.trim() !== "") {
      this.buscar();
    }
  }

  buscar() {
    const query = this.busqueda.value ?? "";

    this.movieService.searchMovies(query)
      .subscribe(Response => {
        this.resultados = Response['results'];
        console.log(Response)
      });
  }

}
