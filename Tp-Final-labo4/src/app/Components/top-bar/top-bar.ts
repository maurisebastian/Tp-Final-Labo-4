import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {

  private readonly router = inject(Router);

  busqueda = new FormControl('');

  buscar() {
    const value = this.busqueda.value ?? ""; 
    this.router.navigate(['/search', value]);
  }

}








