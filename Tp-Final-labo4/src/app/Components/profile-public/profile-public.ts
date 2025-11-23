// src/app/Components/profile-public/profile-public.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { TopBar } from '../top-bar/top-bar';
import { Footer } from '../../Shared/footer/footer';
import { UserActivity } from '../user-activity/user-activity';

import { Profile } from '../../Interfaces/profilein';
import { ProfileService } from '../../Services/profile.service';

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

  // por ahora el follow es solo visual
  isFollowing = false;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    console.log('ProfilePublic -> idParam de la ruta:', idParam, 'tipo:', typeof idParam);

    if (!idParam) {
      this.notFound = true;
      return;
    }

    // ⚠️ IMPORTANTE: NO convertir a Number.
    // Tus ids en db.json son strings como "NnUCsx5", "1d76", etc.
    const id: string = idParam;

    this.profileService.getUserById(id).subscribe({
      next: (p) => {
        if (!p) {
          this.notFound = true;
          return;
        }

        console.log('ProfilePublic -> perfil cargado:', p);

        this.profile = p;
        this.isPrivate = p.isPublic === false;
      },
      error: (err) => {
        console.error('Error cargando perfil público:', err);
        this.notFound = true;
      },
    });
  }

  // botón seguir (por ahora solo cambia el texto)
  toggleFollow() {
    this.isFollowing = !this.isFollowing;
    console.log('Seguir/Dejar de seguir a', this.profile?.id, '->', this.isFollowing);
  }
}
