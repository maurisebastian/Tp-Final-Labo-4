import { Component, inject, Input, OnInit } from '@angular/core';
import { MovieActivityInterface } from '../../Interfaces/reaction';
import { MovieActivity } from '../../Services/movie-activity';
import { AuthService } from '../../auth/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-activity',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './user-activity.html',
  styleUrl: './user-activity.css',
})
export class UserActivity implements OnInit {

  private auth = inject(AuthService);
  private movieActivity = inject(MovieActivity);
  canEdit = false;

  @Input() userId: string | number | null | undefined = null;

  watchedMovies: MovieActivityInterface[] = [];
  toWatchMovies: MovieActivityInterface[] = [];

  expandedMovieId: number | null = null;

  ngOnInit(): void {
  const activeUser = this.auth.getActiveUser()();
   console.log("🔍 UserActivity cargado con userId =", this.userId);

  // ⭐ canEdit solo si estoy viendo mi propio perfil
  this.canEdit = String(activeUser?.id) === String(this.userId);

  if (this.userId) {
    this.loadMovieLists();
  }
}
ngOnChanges() {
  if (this.userId) {
    this.loadMovieLists();
  }
}


  loadMovieLists() {
    if (!this.userId) return;

    this.movieActivity.getWatchedMovies(String(this.userId)).subscribe((data) => {
      this.watchedMovies = data;
    });

    this.movieActivity.getToWatchMovies(String(this.userId)).subscribe((data) => {
      this.toWatchMovies = data;
    });
  }

  toggleDetails(movieId: number) {
    this.expandedMovieId =
      this.expandedMovieId === movieId ? null : movieId;
  }

  markAsWatched(activityId: number) {
    this.movieActivity
      .updateActivity(activityId, {
        status: 'watched',
        watchedDate: new Date().toISOString(),
      })
      .subscribe(() => {
        this.loadMovieLists();
      });
  }

  // 👇 NUEVO: quitar la actividad (vista o por ver)
  removeActivity(activityId: number) {
    this.movieActivity.deleteActivity(activityId)
      .subscribe(() => {
        this.loadMovieLists(); // refresca listas
      });
  }
}
