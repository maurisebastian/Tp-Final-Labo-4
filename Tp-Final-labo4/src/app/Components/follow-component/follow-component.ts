import { Component, inject, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Profile } from '../../Interfaces/profilein';
import { FollowService } from '../../Services/follow-service';
import { ProfileService } from '../../Services/profile.service';
import { CommonModule } from '@angular/common';
import {  RouterModule } from '@angular/router';

@Component({
  selector: 'app-follow-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './follow-component.html',
  styleUrl: './follow-component.css',
})
export class FollowComponent implements OnInit, OnChanges {

  private followService = inject(FollowService);
  private profileService = inject(ProfileService);

  @Input() userId: string | number | undefined;
  @Input() showdeletebutton: boolean = true;

  followers: Profile[] = [];
  following: Profile[] = [];
  loading = true;

  ngOnInit(): void {
    if (!this.userId) return;
    this.loadFollowers();
    this.loadFollowing();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] && !changes['userId'].firstChange) {
   
      this.loadFollowers();
      this.loadFollowing();
    }
  }

  loadFollowers() {
    this.loading = true;

    this.followService.getFollowers(String(this.userId))
      .then(async (follows) => {
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

  removeFollower(followerId: string | number) {
  if (!confirm("¿Eliminar este seguidor?")) return;

  this.followService.unfollow(followerId, this.userId!)
    .then(() => {
      this.followers = this.followers.filter(f => f.id !== followerId);
    })
    .catch(err => console.error("Error al eliminar seguidor:", err));
}
unfollowUser(followingId: string | number) {
  if (!confirm("¿Dejar de seguir a este usuario?")) return;

  this.followService.unfollow(this.userId!, followingId)
    .then(() => {
      this.following = this.following.filter(f => f.id !== followingId);
    })
    .catch(err => console.error("Error al dejar de seguir:", err));
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