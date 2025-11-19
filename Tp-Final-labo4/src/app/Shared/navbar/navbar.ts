import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Signal, effect } from '@angular/core';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  
  activeUser = false;
  private authService = inject(AuthService);

  private _trackUser = effect(() => {
    const user = this.authService.getActiveUser()();
    this.activeUser = !!user;
  });

  constructor(
    private router: Router
  ) { }



  onLogout() {

        this.authService.logout();
        this.router.navigate(['/']);
   
  }

}
