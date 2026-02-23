import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-moviesearch-component',
  imports: [ RouterLink,ReactiveFormsModule],
  templateUrl: './moviesearch-component.html',
  styleUrl: './moviesearch-component.css',
})
export class MoviesearchComponent {
  private router = inject(Router);

  busqueda = new FormControl('', Validators.required);

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

}
