import { Component, inject, OnInit } from '@angular/core';
import { TopBar } from "../top-bar/top-bar";
import { ActivatedRoute } from '@angular/router';
import { TmdbService } from '../../Services/tmdb.service';
import { ReviewList } from "../review-list/review-list";

@Component({
  selector: 'app-movie-review',
  imports: [TopBar, ReviewList],
  templateUrl: './movie-review.html',
  styleUrl: './movie-review.css',
})
export class MovieReview  implements OnInit{

  private route = inject(ActivatedRoute);
  private tmdbService = inject(TmdbService)

  movieId: number = 0;
  
  movieDetails: any;



  ngOnInit() {
    this.route.params.subscribe(params => {
      this.movieId = +params['id']; 
      this.loadMovieDetails();
    });
  }

  loadMovieDetails() {
    this.tmdbService.getMovieDetails(this.movieId).subscribe(
      (response) => {
        this.movieDetails = response;
      },
      (error) => {
        console.error('Error al obtener los detalles de la película:', error);
      }
    );
  }

}
