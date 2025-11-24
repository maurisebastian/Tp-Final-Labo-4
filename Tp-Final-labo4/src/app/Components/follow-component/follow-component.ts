import { Component, inject, Input, OnInit } from '@angular/core';
import { Profile } from '../../Interfaces/profilein';
import { FollowService } from '../../Services/follow-service';
import { ProfileService } from '../../Services/profile.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-follow-component',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './follow-component.html',
  styleUrl: './follow-component.css',
})
export class FollowComponent implements OnInit {


  private followService = inject(FollowService);
  private profileService = inject(ProfileService);
  private router = inject(Router);


  @Input() userId: string | number | undefined;
  @Input() showProfileButton: boolean = true;

  followers: Profile[] = [];
  following: Profile[] = []; 
  loading = true;

  ngOnInit(): void {
    if (!this.userId){
        console.warn("⚠ FollowComponent iniciado sin userId");
      return;
    } 

    this.loadFollowers();
    this.loadFollowing();
  }

  loadFollowers() {
    this.loading = true;

    this.followService.getFollowers(String(this.userId))
      .then(async (follows) => {

        // follows = [{ followerId, followingId }]
        const profiles: Profile[] = [];

        for (const f of follows) {
          const profile = await this.profileService.getUserById(f.followerId).toPromise();
          if (profile) profiles.push(profile);
        }

        this.followers = profiles;
        this.loading = false;
      })
      .catch(() => this.loading = false);
  }
    loadFollowing() {  
    this.followService.getFollowing(String(this.userId))
      .then(async (follows) => {
        const profiles: Profile[] = [];
        for (const f of follows) {
          const profile = await this.profileService.getUserById(f.followingId).toPromise();
          if (profile) profiles.push(profile);
        }
        this.following = profiles;
      });
  }

}
