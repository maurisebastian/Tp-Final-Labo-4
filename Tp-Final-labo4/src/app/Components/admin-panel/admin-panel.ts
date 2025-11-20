import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileService } from '../../Services/profile.service';
import { Profile, Review } from '../../Interfaces/profilein';
import { ReviewService } from '../../Services/review.service';
import { AuthService } from '../../auth/auth-service';
import { TmdbService } from '../../Services/tmdb.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {

  private profileService = inject(ProfileService);
  private router = inject(Router);
  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  private tmdbService = inject(TmdbService);
  private fb = inject(FormBuilder);

  activeUserSignal = this.authService.getActiveUser();

  // ===== USUARIOS =====
  users: Profile[] = [];

  // ===== RESEÑAS / PELÍCULAS =====
  reviews: Review[] = [];                         // todas las reseñas
  groupedReviews: { [movieId: string]: Review[] } = {};          // agrupadas sin filtro
  filteredGroupedReviews: { [movieId: string]: Review[] } = {};  // agrupadas con filtros
  movieTitles: { [id: number]: string } = {};                     // idMovie -> título

  // ===== BÚSQUEDA =====
  userSearch = '';   // texto para buscar por usuario
  movieSearch = '';  // texto para buscar por película

  // ===== FORM NUEVO ADMIN =====
  newAdminForm!: FormGroup;

  ngOnInit(): void {
    const active = this.activeUserSignal();

    // solo admin o superadmin pueden entrar
    if (!active || (active.role !== 'admin' && active.role !== 'superadmin')) {
      this.router.navigate(['/']);
      return;
    }

    // formulario para crear admin
    this.newAdminForm = this.fb.nonNullable.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
    });

    // primero usuarios, luego reseñas
    this.loadUsers();
  }

  // ================= USUARIOS =================

  loadUsers() {
    this.profileService.getAllUsers().subscribe(users => {
      this.users = users;
      this.loadReviews();     // cuando tengo usuarios, cargo reseñas
    });
  }

  goToEditUser(user: Profile) {
    if (!user.id) return;
    this.router.navigate(['/admin/user', user.id]);
  }

  deleteUser(user: Profile) {
    if (!user.id) return;

    const active = this.activeUserSignal();

    if (user.role === 'superadmin') {
      alert('No se puede eliminar al Administrador Principal.');
      return;
    }

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

  // crear admin (solo superadmin)
  createAdmin(event?: Event) {
    if (event) event.preventDefault();

    const active = this.activeUserSignal();
    if (!active || active.role !== 'superadmin') {
      alert('Solo el Administrador Principal puede crear nuevos administradores.');
      return;
    }

    if (this.newAdminForm.invalid) {
      this.newAdminForm.markAllAsTouched();
      return;
    }

    const { username, password, email } = this.newAdminForm.getRawValue();

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !password || !trimmedEmail) {
      alert('Completa usuario, contraseña y email.');
      return;
    }

    if (password.includes(' ')) {
      alert('La contraseña no puede contener espacios.');
      return;
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.profileService.checkUsernameAndEmail(trimmedUsername, trimmedEmail).subscribe({
      next: ({ usernameExists, emailExists }) => {

        if (usernameExists) {
          alert('Ese nombre de usuario ya existe.');
          return;
        }

        if (emailExists) {
          alert('Ese email ya está registrado.');
          return;
        }

        this.profileService.createAdmin({
          username: trimmedUsername,
          password,
          email: trimmedEmail
        }).subscribe({
          next: (created) => {
            if (!created) {
              alert('No se pudo crear el administrador.');
              return;
            }

            this.users.push(created);
            this.newAdminForm.reset();
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

  // ================= RESEÑAS =================

  loadReviews() {
    this.reviewService.getAllReviews().subscribe(revs => {
      // agregar nombre de usuario
      revs.forEach(r => {
        const user = this.users.find(u => u.id === r.idProfile);
        r.userName = user?.username ?? `Perfil ${r.idProfile}`;
      });

      this.reviews = revs;

      // agrupado base
      this.groupedReviews = this.groupByMovie(this.reviews);

      // aplicar filtros iniciales (vacíos)
      this.applyFilters();

      // cargar títulos de películas
      const uniqueIds = Array.from(new Set(revs.map(r => r.idMovie)));

      uniqueIds.forEach(id => {
        if (this.movieTitles[id]) return;

        this.tmdbService.getMovieDetails(id).subscribe({
          next: (movie: any) => {
            const title = movie.title || movie.name || `ID ${id}`;
            this.movieTitles[id] = title;

            this.reviews
              .filter(r => r.idMovie === id)
              .forEach(r => (r.movieName = title));

            this.groupedReviews = this.groupByMovie(this.reviews);
            this.applyFilters();
          },
          error: () => {
            this.movieTitles[id] = `ID ${id}`;
          },
        });
      });
    });
  }

  private groupByMovie(reviews: Review[]): { [movieId: string]: Review[] } {
    const grouped: { [movieId: string]: Review[] } = {};

    for (const r of reviews) {
      const key = String(r.idMovie);
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(r);
    }

    return grouped;
  }

  deleteReview(review: Review) {
    const ok = confirm(
      `¿Seguro que querés eliminar la reseña del usuario ${review.userName ?? review.idProfile} sobre la película ${review.movieName ?? review.idMovie}?`
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
        this.applyFilters();
      },
      error: () => {
        alert('No se pudo eliminar la reseña.');
      }
    });
  }

  // ================= FILTROS (BÚSQUEDA) =================

  onUserSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value || '';
    this.userSearch = value.trim().toLowerCase();
    this.applyFilters();
  }

  onMovieSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value || '';
    this.movieSearch = value.trim().toLowerCase();
    this.applyFilters();
  }

  private applyFilters() {
    const userTerm = this.userSearch;
    const movieTerm = this.movieSearch;

    if (!userTerm && !movieTerm) {
      // sin filtros -> usar agrupado original
      this.filteredGroupedReviews = this.groupedReviews;
      return;
    }

    // filtrar reseñas planas
    const filtered = this.reviews.filter(r => {
      const userName = (r.userName ?? '').toLowerCase();
      const movieName = (r.movieName ?? '').toLowerCase();

      const userOk = !userTerm || userName.includes(userTerm);
      const movieOk = !movieTerm || movieName.includes(movieTerm);

      return userOk && movieOk;
    });

    this.filteredGroupedReviews = this.groupByMovie(filtered);
  }
}
