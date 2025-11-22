import { Component, inject } from '@angular/core';
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

  // 👇 lo dejamos en any para no discutir con TS
  userId: any = null;

  watchedMovies: MovieActivityInterface[] = [];
  toWatchMovies: MovieActivityInterface[] = [];

  expandedMovieId: number | null = null;

  ngOnInit(): void {
    const activeUser = this.auth.getActiveUser()();
    this.userId = activeUser?.id ?? null;

    if (this.userId) {
      this.loadMovieLists();
    }
  }

  loadMovieLists() {
    if (!this.userId) return;

    this.movieActivity.getWatchedMovies(this.userId).subscribe((data) => {
      this.watchedMovies = data;
    });

    this.movieActivity.getToWatchMovies(this.userId).subscribe((data) => {
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
}
