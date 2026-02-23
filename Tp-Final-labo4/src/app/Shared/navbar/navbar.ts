import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {  effect } from '@angular/core';
import { AuthService } from '../../auth/auth-service';
import { TopBar } from '../../Components/top-bar/top-bar';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, TopBar],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  
  activeUser = false;
  private authService = inject(AuthService);
  private router = inject(Router);

  showTopbar = true;
  private lastY: number | null = null;
  private readonly threshold = 12; 


  private _trackUser = effect(() => {
    const user = this.authService.getActiveUser()();
    this.activeUser = !!user;
  this.lastY = null;                 // resetea al cambiar sesión
  this.showTopbar = this.activeUser;
  });
  
@HostListener('window:scroll')
onScroll() {
  if (!this.activeUser) return;

  const y = window.scrollY || 0;

  // primera vez
  if (this.lastY === null) {
    this.lastY = y;
    return;
  }

  const delta = y - this.lastY;

  if (y < 10) {
    this.showTopbar = true;
    this.lastY = y;
    return;
  }

  if (Math.abs(delta) < this.threshold) return;

  this.showTopbar = delta < 0;
  this.lastY = y;
}

  onLogout() {

        this.authService.logout();
        this.router.navigate(['/']);
   
  }

}
