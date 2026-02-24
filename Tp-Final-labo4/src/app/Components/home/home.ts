import { Component, OnInit, inject } from '@angular/core';

import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../auth/auth-service';
import { Carrusel } from '../carrusel/carrusel';
import { MoviesearchComponent } from "../../Shared/moviesearch-component/moviesearch-component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Carrusel, MoviesearchComponent,RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  activeUserSignal = this.authService.getActiveUser();

  ngOnInit(): void {
    const user = this.activeUserSignal();

    // Si es admin/superadmin → va directo al dashboard
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      this.router.navigate(['/admin']);
      return;
    }
  }
}
