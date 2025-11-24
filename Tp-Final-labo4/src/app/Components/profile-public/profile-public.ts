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

// ⭐ LISTA DE GÉNEROS — ACÁ ESTÁ LA SOLUCIÓN
const GENRES = [
  { id: 28, name: 'Acción' },
  { id: 12, name: 'Aventura' },
  { id: 16, name: 'Animación' },
  { id: 35, name: 'Comedia' },
  { id: 80, name: 'Crimen' },
  { id: 18, name: 'Drama' },
  { id: 10749, name: 'Romance' },
  { id: 53, name: 'Suspenso' },
];

@Component({
  selector: 'app-profile-public',
  standalone: true,
  imports: [TopBar, Footer, UserActivity,FollowComponent, CommonModule, RouterModule],
  templateUrl: './profile-public.html',
  styleUrl: './profile-public.css',
})
export class ProfilePublic implements OnInit {

  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private followService = inject(FollowService);
  private auth = inject(AuthService);

  activeUserId: string | number | null = null;


  profile: Profile | null = null;
  isPrivate = false;
  notFound = false;

  isFollowing = false;

  // ⭐ acá queda el array verdadero, NO el componente
  genreNames = GENRES;
ngOnInit(): void {

  const activeUser = this.auth.getActiveUser()();
  this.activeUserId = activeUser?.id ?? null;

  // 👇 ESCUCHA CAMBIOS EN LA RUTA
  this.route.paramMap.subscribe(params => {
    
    const id = params.get('id');
    if (!id) {
      this.notFound = true;
      return;
    }

    // vuelve a cargar el perfil
    this.loadProfile(id);
  });
}

private loadProfile(id: string) {
  this.profileService.getUserById(id).subscribe({
    next: (p) => {
      if (!p) {
        this.notFound = true;
        return;
      }

      this.profile = p;
      this.isPrivate = p.isPublic === false;

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

  // ⭐ Función para traducir ID → nombre
  getGenreName(id: number | string): string {
    const numericId = typeof id === 'string' ? Number(id) : id;
    const genre = this.genreNames.find(g => g.id === numericId);
    return genre ? genre.name : String(id);
  }
}
