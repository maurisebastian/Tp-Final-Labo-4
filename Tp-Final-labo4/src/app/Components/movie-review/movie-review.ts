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

  userId: number | null = null;
  activity: MovieActivityInterface | null = null;

  ngOnInit() {
    const user = this.auth.getActiveUser()();
    this.userId = user?.id || null;

    this.route.params.subscribe(params => {
      this.movieId = +params['id'];
      this.loadMovieDetails();
      this.loadActivity();
    });
  }

  loadMovieDetails() {
    this.tmdbService.getMovieDetails(this.movieId).subscribe(
      (response) => (this.movieDetails = response),
      (error) => console.error('Error al obtener los detalles:', error)
    );
  }

  loadActivity() {
    if (!this.userId) return;

    this.movieActivity.getActivitiesByUser(this.userId).subscribe(list => {
      this.activity = list.find(a => a.idMovie === this.movieId) || null;
    });
  }

  markAs(status: 'watched' | 'towatch') {
    if (!this.userId) return;

    if (!this.activity) {
      const newAct: MovieActivityInterface = {
        idProfile: this.userId,
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
      }

      this.movieActivity.updateActivity(this.activity.id!, payload)
        .subscribe(() => this.loadActivity());
    }
  }
}
