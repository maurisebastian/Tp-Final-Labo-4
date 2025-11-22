import { Component, inject, OnInit } from '@angular/core';
import { ProfileService } from '../../Services/profile.service';
import { AuthService } from '../../auth/auth-service';
import { Profile } from '../../Interfaces/profilein';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profiles-list',
  imports: [RouterLink],
  templateUrl: './profiles-list.html',
  styleUrl: './profiles-list.css',
})
export class ProfilesList implements OnInit {

  private profileService = inject(ProfileService);
  private auth = inject(AuthService);

  profiles: Profile[] = [];
  activeUserId = this.auth.getActiveUser()()?.id;

 ngOnInit() {
  this.profileService.getAllUsers().subscribe({
    next: (p) => {
      this.profiles = p.filter(user => user.id !== this.activeUserId);
    },
    error: (err) => {
      console.error('Error cargando perfiles', err);
    }
  });
}
}


