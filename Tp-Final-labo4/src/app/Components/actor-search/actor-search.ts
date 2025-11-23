import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TmdbService } from '../../Services/tmdb.service';

@Component({
  selector: 'app-actor-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './actor-search.html',
  styleUrl: './actor-search.css',
})
export class ActorSearch {

  private tmdb = inject(TmdbService);
  private router = inject(Router);

  busqueda = new FormControl('', Validators.required);
  resultados: any[] = [];

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

    this.tmdb.searchActors(query).subscribe((res: any) => {
      this.resultados = res?.results ?? [];
    });
  }

  verActor(actor: any) {
    this.router.navigate(['/actor', actor.id]);
  }
}
