import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ProfileService } from '../../Services/profile.service';
import { Signal, effect } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  activeUser = false;

  private _trackUser = effect(() => {
    const user = this.profileService.activeUser();
    this.activeUser = !!user;
  });

  constructor(
    private profileService: ProfileService,
    private router: Router
  ) { }



  onLogout() {
    this.profileService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      }
    });
  }

}
