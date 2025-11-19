import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../Services/profile.service';
import { Profile, Review } from '../../Interfaces/profilein';
import { ReviewService } from '../../Services/review.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {

  private profileService = inject(ProfileService);
  private router = inject(Router);
  private reviewService = inject(ReviewService);

  activeUserSignal = this.profileService.auth();

  // usuarios
  users: Profile[] = [];

  // para crear nuevos admins
  newAdminUsername = '';
  newAdminPassword = '';
  newAdminEmail = '';

  // reseñas
  reviews: Review[] = [];
  groupedReviews: { [movieId: string]: Review[] } = {};

  ngOnInit(): void {
    const active = this.activeUserSignal();

    // solo admin o superadmin pueden entrar
    if (!active || (active.role !== 'admin' && active.role !== 'superadmin')) {
      this.router.navigate(['/']);
      return;
    }

    this.loadUsers();
    this.loadReviews();
  }

  // ====== USUARIOS ======

  loadUsers() {
    this.profileService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  deleteUser(user: Profile) {
    if (!user.id) return;

    const active = this.activeUserSignal();

    // nadie puede borrar al superadmin
    if (user.role === 'superadmin') {
      alert('No se puede eliminar al Administrador Principal.');
      return;
    }

    // opcional: que nadie pueda borrarse a sí mismo
    if (active && active.id === user.id) {
      alert('No podés eliminar tu propio usuario.');
      return;
    }

    const ok = confirm(`¿Seguro que querés eliminar al usuario "${user.username}"?`);
    if (!ok) return;

    this.profileService.deleteUser(user.id).subscribe(result => {
      if (result) {
        this.users = this.users.filter(u => u.id !== user.id);
      } else {
        alert('No se pudo eliminar el usuario.');
      }
    });
  }

  // SOLO el superadmin puede crear nuevos admins
  createAdmin() {
    const active = this.activeUserSignal();
    if (!active || active.role !== 'superadmin') {
      alert('Solo el Administrador Principal puede crear nuevos administradores.');
      return;
    }

    const username = this.newAdminUsername.trim();
    const password = this.newAdminPassword; // NO trim para no borrar al principio/fin si quisieras
    const email = this.newAdminEmail.trim();

    // -------- VALIDACIONES BÁSICAS --------
    if (!username || !password || !email) {
      alert('Completa usuario, contraseña y email.');
      return;
    }

    // ✔ VALIDAR FORMATO DE EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('El email no tiene un formato válido.');
      return;
    }

    // NO PERMITIR ESPACIOS EN LA CONTRASEÑA
    if (password.includes(' ')) {
      alert('La contraseña no puede contener espacios.');
      return;
    }

    // ✔ OPCIONAL: VALIDAR LARGO MÍNIMO
    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // -------- VALIDAR DUPLICADOS EN LA BASE --------
    this.profileService.checkUsernameAndEmail(username, email).subscribe({
      next: ({ usernameExists, emailExists }) => {

        if (usernameExists) {
          alert('Ese nombre de usuario ya existe.');
          return;
        }

        if (emailExists) {
          alert('Ese email ya está registrado.');
          return;
        }

        // -------- CREAR ADMIN --------
        this.profileService.createAdmin({ username, password, email }).subscribe({
          next: (created) => {
            if (!created) {
              alert('No se pudo crear el administrador.');
              return;
            }

            this.users.push(created);

            this.newAdminUsername = '';
            this.newAdminPassword = '';
            this.newAdminEmail = '';

            alert('Administrador creado correctamente.');
          },
          error: () => {
            alert('No se pudo crear el administrador.');
          }
        });

      },
      error: () => {
        alert('Error al validar usuario/email.');
      }
    });
  }

  // ====== RESEÑAS ======

  loadReviews() {
    this.reviewService.getAllReviews().subscribe(revs => {
      this.reviews = revs;
      this.groupedReviews = this.groupByMovie(revs);
    });
  }

  private groupByMovie(reviews: Review[]): { [movieId: string]: Review[] } {
    const grouped: { [movieId: string]: Review[] } = {};

    for (const r of reviews) {
      const key = String(r.idMovie); // agrupamos por idMovie
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(r);
    }

    return grouped;
  }

  deleteReview(review: Review) {
    const ok = confirm(
      `¿Seguro que querés eliminar la reseña del perfil ${review.idProfile} sobre la película ID ${review.idMovie}?`
    );
    if (!ok) return;

    if (!review.id) {
      console.error('La reseña no tiene id, no se puede borrar');
      return;
    }

    this.reviewService.deleteReviewById(review.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== review.id);
        this.groupedReviews = this.groupByMovie(this.reviews);
      },
      error: () => {
        alert('No se pudo eliminar la reseña.');
      }
    });
  }

}
