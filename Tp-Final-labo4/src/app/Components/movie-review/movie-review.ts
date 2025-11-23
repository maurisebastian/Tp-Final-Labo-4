import { Component, inject, OnInit } from '@angular/core';
import { TopBar } from "../top-bar/top-bar";
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TmdbService } from '../../Services/tmdb.service';
import { ReviewList } from "../review-list/review-list";
import { AuthService } from '../../auth/auth-service';
import { MovieActivity } from '../../Services/movie-activity';
import { MovieActivityInterface } from '../../Interfaces/reaction';

@Component({
  selector: 'app-movie-review',
  standalone: true,
  imports: [TopBar, ReviewList, CommonModule, DatePipe],
  templateUrl: './movie-review.html',
  styleUrl: './movie-review.css',
})
export class MovieReview implements OnInit {

  private route = inject(ActivatedRoute);
  private tmdbService = inject(TmdbService);
  private auth = inject(AuthService);
  private movieActivity = inject(MovieActivity);

  movieId: number = 0;
  movieDetails: any;
  cast: any[] = [];

  // puede ser string o number
  userId: string | number | null = null;
  activity: MovieActivityInterface | null = null;

  ngOnInit() {
    const user = this.auth.getActiveUser()();
    console.log('MovieReview - activeUser:', user);
    this.userId = user?.id ?? null;

    // tomamos id o idProfile SIN convertir a número
    const rawId =
      user
        ? (user as any).id ?? (user as any).idProfile
        : null;

    this.userId = rawId ?? null;
    console.log('MovieReview - userId calculado:', this.userId);

    this.route.params.subscribe(params => {
      this.movieId = Number(params['id'] ?? 0);
      this.loadMovieDetails();
      this.loadActivity();
      this.loadCast();
    });
  }

  loadMovieDetails() {
    if (!this.movieId) return;

    this.tmdbService.getMovieDetails(this.movieId).subscribe(
      (response) => (this.movieDetails = response),
      (error) => console.error('Error al obtener los detalles:', error)
    );
  }

  loadActivity() {
    if (!this.userId || !this.movieId) return;

    // usamos userId tal cual, casteado a any para que TS no moleste
    this.movieActivity.getActivitiesByUser(this.userId as any).subscribe(list => {
      this.activity = list.find(a => a.idMovie === this.movieId) || null;
    });
  }

  markAs(status: 'watched' | 'towatch') {
    if (!this.userId || !this.movieId) return;

    const idProfile = this.userId as any;

    if (!this.activity) {
      const newAct: MovieActivityInterface = {
        idProfile,
        idMovie: this.movieId,
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

  // 👉 SOLO dejamos esto para los actores
  loadCast() {
    if (!this.movieId) return;

    this.tmdbService.getMovieCredits(this.movieId).subscribe(credits => {
      this.cast = (credits?.cast ?? []).slice(0, 8);
    });
  }
}
