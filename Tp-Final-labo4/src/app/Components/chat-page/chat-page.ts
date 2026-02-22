import { Component, inject, OnInit, signal } from '@angular/core';
import { FollowService } from '../../Services/follow-service';
import { AuthService } from '../../auth/auth-service';
import { ProfileService } from '../../Services/profile.service';
import { ChatService } from '../../Services/chat-service';
import { Profile } from '../../Interfaces/profilein';
import { CommonModule } from '@angular/common';
import { ChatWindow } from "../chat-window/chat-window";
import { firstValueFrom, forkJoin } from 'rxjs';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, ChatWindow],
  templateUrl: './chat-page.html',
  styleUrl: './chat-page.css',
})
export class ChatPage implements OnInit {
  
  private followService = inject(FollowService);
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private chatService = inject(ChatService);

  activeUser = this.auth.getActiveUser()();

  friends = signal<Profile[]>([]);
  selectedFriend = signal<Profile | null>(null);

  ngOnInit() {
    this.loadFriends();
  }

 async loadFriends() {
  if (!this.activeUser) return;

  const myId = this.activeUser.id!;

  const following = await this.followService.getFollowing(myId);
  const followers = await this.followService.getFollowers(myId);

  const mutualIds = following
    .filter(f => followers.some(ff => ff.followerId === f.followingId))
    .map(f => f.followingId);

  if (mutualIds.length === 0) {
    this.friends.set([]);
    return;
  }

  const requests = mutualIds.map(id =>
    this.profileService.getUserById(id)
  );

  const users = await firstValueFrom(forkJoin(requests));

  this.friends.set(users);
}

  selectFriend(friend: Profile) {
    this.selectedFriend.set(friend);
  }

}
