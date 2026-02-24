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
  unreadByFriend = signal<Record<string, number>>({});

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
    this.computeUnreadPerFriend(users);

  }

  selectFriend(friend: Profile) {
    this.selectedFriend.set(friend);
  const current = { ...this.unreadByFriend() };
  current[String(friend.id)] = 0;
  this.unreadByFriend.set(current);
   if (!this.activeUser) return;
  this.chatService.markAsRead(this.activeUser.id!, friend.id!).subscribe();

  }
private normalizeUsers(a: any, b: any) {
  return a < b ? { userAId: a, userBId: b } : { userAId: b, userBId: a };
}

private computeUnreadPerFriend(friends: Profile[]) {
  if (!this.activeUser) return;

  const myId = this.activeUser.id!;

  this.chatService.getAllMessages().subscribe((msgs) => {
    const map: Record<string, number> = {};

    for (const f of friends) {
      const ids = this.normalizeUsers(myId, f.id);

      map[String(f.id)] = msgs.filter(m =>
        // la conversación correcta (normalizada)
        m.userAId == ids.userAId &&
        m.userBId == ids.userBId &&

        // me lo mandó el amigo a mí
        m.senderId == f.id &&

        // no leído
        m.read !== true
      ).length;
    }

    this.unreadByFriend.set(map);
  });
}

}
