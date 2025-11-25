import { Component, inject, OnInit } from '@angular/core';
import { TopBar } from "../top-bar/top-bar";
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TmdbService } from '../../Services/tmdb.service';
import { ReviewList } from '../review-list/review-list';
import { AuthService } from '../../auth/auth-service';
import { MovieActivity } from '../../Services/movie-activity';
import { MovieActivityInterface } from '../../Interfaces/reaction';
import { HiddenMoviesService } from '../../Services/hidden-movies.service';
import { AdminMoviesService } from '../../Services/movies.service';


@Component({
  selector: 'app-movie-review',
  standalone: true,
  imports: [TopBar, ReviewList, CommonModule, DatePipe, RouterModule],
  templateUrl: './movie-review.html',
  styleUrl: './movie-review.css',
})
export class MovieReview implements OnInit {

  private route = inject(ActivatedRoute);
  private tmdbService = inject(TmdbService);
  private auth = inject(AuthService);
  private movieActivity = inject(MovieActivity);
  private authService = inject(AuthService);
  private hiddenMoviesService = inject(HiddenMoviesService);
  private adminMovies = inject(AdminMoviesService);

  // Puede ser TMDB (number) o local (string)
  movieId: number | string | undefined = undefined;

  // Marca si la peli es local (admin)
  movieIsLocal = false;

  movieDetails: any;
  cast: any[] = [];

  // puede ser string o number
  userId: string | number | null = null;
  activity: MovieActivityInterface | null = null;

  // ¿el usuario logueado es admin?
  get isAdmin(): boolean {
    const user = this.authService.getActiveUser()();
    return !!user && (user.role === 'admin' || user.role === 'superadmin');
  }

  // ¿La peli está oculta para este usuario (no admin)?
  get isHiddenForUser(): boolean {
    return this.isHidden && !this.isAdmin;
  }

  // ¿esta peli está oculta según HiddenMoviesService?
  // Sólo aplica cuando es una peli TMDB (id numérico)
  get isHidden(): boolean {
    return typeof this.movieId === 'number'
      ? this.hiddenMoviesService.isHidden(this.movieId)
      : false;
  }

  // Motivo de ocultamiento (si existe)
  get hiddenReason(): string {
    if (typeof this.movieId !== 'number') return '';
    const entry = this.hiddenMoviesService.getEntry(this.movieId);
    return entry?.reason ?? '';
  }

  ngOnInit() {
    const user = this.auth.getActiveUser()();

    // tomamos id o idProfile SIN convertir a número
    const rawId =
      user
        ? (user as any).id ?? (user as any).idProfile
        : null;

    this.userId = rawId ?? null;

    this.route.params.subscribe(params => {
      const idParam = params['id'];

      if (!idParam) {
        this.movieId = undefined;
        return;
      }

      // Si es número → TMDB, si no → local
      const asNumber = Number(idParam);
      this.movieId = Number.isNaN(asNumber) ? idParam : asNumber;



      this.loadMovieDetails();
      this.loadActivity();
      // el cast se carga dentro de loadMovieDetails cuando es TMDB
    });
  }

  loadMovieDetails() {
    if (this.movieId === undefined) return;

    // 🔹 Caso TMDB (id numérico)
    if (typeof this.movieId === 'number') {
      this.tmdbService.getMovieDetails(this.movieId).subscribe({
        next: (response) => {
          this.movieIsLocal = false;
          this.movieDetails = response;
          this.loadCast(); // sólo TMDB
        },
        error: () => {
          // Si falla TMDB, probamos si existe una peli local ligada a ese tmdbId
          this.adminMovies.findByTmdbId(this.movieId as number).subscribe({
            next: (local: any) => {
              if (!local) return;

              this.movieIsLocal = true;
              this.movieDetails = {
                title: local.title,
                overview: local.overview,
                poster_path: local.posterPath,
                release_date: null,
                runtime: null,
                vote_average: null,
                genres: [],
              };
              this.cast = [];
            },
            error: (err: any) => {
              console.error('Error buscando película local por tmdbId:', err);
            }
          });
        },
      });

      return;
    }

    // 🔹 Caso película local (id string)
    this.adminMovies.getById(this.movieId).subscribe({
      next: (local: any) => {
        if (!local) return;

        this.movieIsLocal = true;
        this.movieDetails = {
          title: local.title,
          overview: local.overview,
          poster_path: local.posterPath,
          release_date: null,
          runtime: null,
          vote_average: null,
          genres: [],
        };
        this.cast = [];
      },
      error: (err: any) => {
        console.error('Error obteniendo película local por id:', err);
      }
    });
  }

  // Ocultar / mostrar desde el detalle
  // Sólo tiene sentido para pelis TMDB (id numérico)
  toggleHiddenFromDetail(): void {
    if (!this.isAdmin || typeof this.movieId !== 'number') return;

    if (this.hiddenMoviesService.isHidden(this.movieId)) {
      this.hiddenMoviesService.unhideMovie(this.movieId);
      return;
    }

    const title = this.movieDetails?.title || 'esta película';
    const reason = window.prompt(`¿Por qué querés ocultar "${title}"?`);

    if (!reason || !reason.trim()) return;

    this.hiddenMoviesService.hideMovie(
      this.movieId,
      reason.trim(),
      this.movieDetails?.title
    );
  }

  loadActivity() {
    if (!this.userId || this.movieId == null) return;

    this.movieActivity.getActivitiesByUser(this.userId as any).subscribe(list => {
      // Comparamos como string para que funcione '238' y 238, o 'b89c'
      const currentId = String(this.movieId);
      this.activity = list.find(a => String(a.idMovie) === currentId) || null;
    });
  }

  markAs(status: 'watched' | 'towatch') {
    if (!this.userId || this.movieId == null) return;

    const idProfile = this.userId as any;
    const idMovie = this.movieId as any; // puede ser string o number

    if (!this.activity) {
      const newAct: MovieActivityInterface = {
        idProfile,
        idMovie,
        movieName: this.movieDetails?.title,
        status,
        watchedDate: status === 'watched'
          ? new Date().toISOString()
          : null
      };

      this.movieActivity.addActivity(newAct).subscribe(saved => {
        this.activity = saved;
      });

    } else {
      const payload: any = { status };

      if (status === 'watched') {
        payload.watchedDate = new Date().toISOString();
      } else {
        payload.watchedDate = null;
      }

      this.movieActivity.updateActivity(this.activity.id!, payload)
        .subscribe(() => this.loadActivity());
    }
  }

  // Reparto (sólo TMDB)
  loadCast() {
    if (typeof this.movieId !== 'number') {
      this.cast = [];
      return;
    }

    this.tmdbService.getMovieCredits(this.movieId).subscribe(credits => {
      this.cast = (credits?.cast ?? []).slice(0, 8);
    });
  }
}
