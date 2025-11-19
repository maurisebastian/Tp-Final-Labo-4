import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {

  private readonly router = inject(Router);

  busqueda = new FormControl('', Validators.required);

  buscar() {
    const value = (this.busqueda.value ?? '').trim();

    if (!value) {
      this.busqueda.markAsTouched();
      return;
    }

    this.router.navigate(['/search', value]);
  }
}
