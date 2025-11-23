import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { TopBar } from '../top-bar/top-bar';
import { Footer } from '../../Shared/footer/footer';
import { UserActivity } from '../user-activity/user-activity';

import { Profile } from '../../Interfaces/profilein';
import { ProfileService } from '../../Services/profile.service';

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
  imports: [TopBar, Footer, UserActivity, CommonModule],
  templateUrl: './profile-public.html',
  styleUrl: './profile-public.css',
})
export class ProfilePublic implements OnInit {

  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);

  profile: Profile | null = null;
  isPrivate = false;
  notFound = false;

  isFollowing = false;

  // ⭐ acá queda el array verdadero, NO el componente
  genreNames = GENRES;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.notFound = true;
      return;
    }

    const id: string = idParam;

    this.profileService.getUserById(id).subscribe({
      next: (p) => {
        if (!p) {
          this.notFound = true;
          return;
        }

        this.profile = p;
        this.isPrivate = p.isPublic === false;
      },
      error: () => {
        this.notFound = true;
      },
    });
  }

  toggleFollow() {
    this.isFollowing = !this.isFollowing;
  }

  // ⭐ Función para traducir ID → nombre
  getGenreName(id: number | string): string {
    const numericId = typeof id === 'string' ? Number(id) : id;
    const genre = this.genreNames.find(g => g.id === numericId);
    return genre ? genre.name : String(id);
  }
}
