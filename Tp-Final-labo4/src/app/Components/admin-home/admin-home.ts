import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.css',
})
export class AdminHomeComponent implements OnInit {

  private router = inject(Router);
  private authService = inject(AuthService);

  activeUserSignal = this.authService.getActiveUser();

  ngOnInit(): void {
    const user = this.activeUserSignal();
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      this.router.navigate(['/']);
    }
  }

   goTo(section: 'users' | 'new-admin' | 'reviews' | 'reports' | 'movies') {
    this.router.navigate([`/admin/${section}`]);
  }

}
