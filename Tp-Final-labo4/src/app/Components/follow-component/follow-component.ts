import { Component, inject, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Profile } from '../../Interfaces/profilein';
import { FollowService } from '../../Services/follow-service';
import { ProfileService } from '../../Services/profile.service';
import { CommonModule } from '@angular/common';
import {  RouterModule } from '@angular/router';
import { ConfimDialog } from '../../Shared/confim-dialog/confim-dialog';

@Component({
  selector: 'app-follow-component',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfimDialog],
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


  @ViewChild('confirmDialog') confirmDialog!: any;

  dialogTitle = "";
  dialogDescription = "";
  pendingAction: (() => void) | null = null;

  openConfirmation(title: string, description: string, action: () => void) {
    this.dialogTitle = title;
    this.dialogDescription = description;
    this.pendingAction = action;
    this.confirmDialog.open();
  }

  executePendingAction() {
    if (this.pendingAction) this.pendingAction();
    this.pendingAction = null;
  }

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
    this.openConfirmation(
      "Eliminar seguidor",
      "¿Seguro que querés eliminar a este seguidor?",
      () => {
        this.followService.unfollow(followerId, this.userId!)
          .then(() => this.followers = this.followers.filter(f => f.id !== followerId))
          .catch(err => console.error("Error:", err));
      }
    );
  }
  unfollowUser(followingId: string | number) {
    this.openConfirmation(
      "Dejar de seguir",
      "¿Seguro que querés dejar de seguir a este usuario?",
      () => {
        this.followService.unfollow(this.userId!, followingId)
          .then(() => this.following = this.following.filter(f => f.id !== followingId))
          .catch(err => console.error("Error:", err));
      }
    );
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