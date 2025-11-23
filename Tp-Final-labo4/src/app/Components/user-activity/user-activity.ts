import { Component, inject, Input } from '@angular/core';
import { MovieActivityInterface } from '../../Interfaces/reaction';
import { MovieActivity } from '../../Services/movie-activity';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-user-activity',
  standalone: true,
  imports: [],
  templateUrl: './user-activity.html',
  styleUrl: './user-activity.css',
})
export class UserActivity {

  private auth = inject(AuthService);
  private movieActivity = inject(MovieActivity);
  canEdit = false;

  @Input() userId: string | number | null | undefined = null;

  watchedMovies: MovieActivityInterface[] = [];
  toWatchMovies: MovieActivityInterface[] = [];

  expandedMovieId: number | null = null;

  ngOnInit(): void {
  const activeUser = this.auth.getActiveUser()();

  // ⭐ canEdit solo si estoy viendo mi propio perfil
  this.canEdit = String(activeUser?.id) === String(this.userId);

  if (this.userId) {
    this.loadMovieLists();
  }
}


  loadMovieLists() {
    if (!this.userId) return;

    this.movieActivity.getWatchedMovies(this.userId as any).subscribe((data) => {
      this.watchedMovies = data;
    });

    this.movieActivity.getToWatchMovies(this.userId as any).subscribe((data) => {
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
