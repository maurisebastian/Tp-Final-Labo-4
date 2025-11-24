// src/app/Components/profile-public/profile-public.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { TopBar } from '../top-bar/top-bar';
import { Footer } from '../../Shared/footer/footer';
import { UserActivity } from '../user-activity/user-activity';

import { Profile } from '../../Interfaces/profilein';
import { ProfileService } from '../../Services/profile.service';
import { FollowService } from '../../Services/follow-service';
import { AuthService } from '../../auth/auth-service';
import { FollowComponent } from '../follow-component/follow-component';
import { TmdbService } from '../../Services/tmdb.service'; 

@Component({
  selector: 'app-profile-public',
  standalone: true,
  imports: [TopBar, Footer, UserActivity, FollowComponent, CommonModule, RouterModule],
  templateUrl: './profile-public.html',
  styleUrl: './profile-public.css',
})
export class ProfilePublic implements OnInit {

  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private followService = inject(FollowService);
  public auth = inject(AuthService);
  private tmdbService = inject(TmdbService); // 🟢 INYECTADO

  activeUserId: string | number | null = null;

  profile: Profile | null = null;
  isPrivate = false;
  notFound = false;

  isFollowing = false;

  ngOnInit(): void {
    const activeUser = this.auth.getActiveUser()();
    this.activeUserId = activeUser?.id ?? null;

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (!id) {
        this.notFound = true;
        return;
      }

      this.loadProfile(id);
    });
  }

  loadProfile(id: string) {
    this.profileService.getUserById(id).subscribe({
      next: (p) => {
        if (!p) {
          this.notFound = true;
          return;
        }

        this.profile = p;

        this.isPrivate = (p.isPublic === false) && !this.auth.isAdmin();

        if (this.activeUserId) {
          this.followService
            .isFollowing(this.activeUserId, p.id!)
            .subscribe(isF => {
              this.isFollowing = isF;
            });
        }
      },
      error: () => {
        this.notFound = true;
      },
    });
  }

  async toggleFollow() {
    if (!this.activeUserId || !this.profile) return;

    const follower = this.activeUserId;
    const following = this.profile.id!;

    if (this.isFollowing) {
      await this.followService.unfollow(follower, following);
      this.isFollowing = false;
    } else {
      await this.followService.follow(follower, following);
      this.isFollowing = true;
    }
  }

  getGenreName(id: number | string): string {
  const numericId = typeof id === 'string' ? Number(id) : id;
  return this.tmdbService.getGenreName(numericId) ?? '';
}

}
