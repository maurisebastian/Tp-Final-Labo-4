import { Component, inject } from '@angular/core';
import { Profile } from '../../Interfaces/profilein';
import { ProfileService } from '../../Services/profile.service';
import { FollowService } from '../../Services/follow-service';
import { AuthService } from '../../auth/auth-service';
import { ActivatedRoute } from '@angular/router';
import { UserActivity } from "../user-activity/user-activity";

@Component({
  selector: 'app-profile-public',
  imports: [UserActivity],
  templateUrl: './profile-public.html',
  styleUrl: './profile-public.css',
})
export class ProfilePublic {

  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private followService = inject(FollowService);
  private auth = inject(AuthService);

  profile!: Profile
  isFollowing = false;
  activeId = this.auth.getActiveUser()()?.id;

 ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');

  // Obtener perfil del usuario
  this.profileService.getUserById(id!).subscribe({
    next: (profile) => {
      this.profile = profile;

      // Luego de obtener el perfil, verificamos follow
      this.followService.isFollowing(this.activeId!, id!).subscribe({
        next: (isFollow) => {
          this.isFollowing = isFollow;
        }
      });
    },
    error: (err) => {
      console.error("Error cargando perfil", err);
    }
  });
}

  async toggleFollow() {
    if (this.isFollowing) {
      await this.followService.unfollow(this.activeId!, this.profile.id!);
      this.isFollowing = false;
    } else {
      await this.followService.follow(this.activeId!, this.profile.id!);
      this.isFollowing = true;
    }
  }

}
