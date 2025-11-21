import { Component, effect, inject, input } from '@angular/core';
import { ReviewService } from '../../Services/review.service';
import { ProfileService } from '../../Services/profile.service';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Profile, Review } from '../../Interfaces/profilein';
import { ReviewComment } from '../../Interfaces/profilein';
import { AuthService } from '../../auth/auth-service';
import { ReviewLikeService } from '../../Services/review-like-service'; 
import { forkJoin, map, of } from 'rxjs';
import { ComentService } from '../../Services/coment-service';

@Component({
  selector: 'app-review-list',
  imports: [ReactiveFormsModule],
  templateUrl: './review-list.html',
  styleUrl: './review-list.css',
})
export class ReviewList {

  private readonly reviewService = inject(ReviewService);
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  private readonly likeService = inject(ReviewLikeService);
  private comentService = inject(ComentService);

  protected fb = inject(FormBuilder);

  peliculaID = input<number>();

  userId: number | undefined = undefined;
  reviews: any[] = [];

  starRating = 0;
  userLoggedIn: boolean = false;
  userProfile: Profile | undefined;
 commentControls: { [key: number]: FormControl } = {};

getControl(reviewId: number): FormControl {
  if (!this.commentControls[reviewId]) {
    this.commentControls[reviewId] = new FormControl('');
  }
  return this.commentControls[reviewId];
}

  protected readonly reviewForm = this.fb.nonNullable.group({
    score: this.fb.nonNullable.control(0, Validators.required),
    description: ['', [Validators.required, Validators.minLength(5)]],
  });

  get score() {
    return this.reviewForm.controls.score;
  }
  get description() {
    return this.reviewForm.controls.description;
  }

  ngOnInit(): void {
 
  }


  loadReviews() {
    const id = this.peliculaID();
    if (!id) return;

    this.reviewService.getReviewsByMovieId(id).subscribe((reviews) => {

      const procesos = reviews.map((review) => {
        return forkJoin({
          user: this.profileService.getUserById(review.idProfile),
          likes: this.likeService.getLikesByReview(review.id!),
          likedByUser: this.userId
            ? this.likeService.getLike(this.userId, review.id!)
            : of([]),
          comments: this.comentService.getComments(review.id!) // 👈 NUEVO
        }).pipe(
          map(({ user, likes, likedByUser, comments }) => {
            review.userName = user.username;
            review.likesCount = likes.length;
            review.likedByUser = likedByUser.length > 0;

            // 👇 LOS COMENTARIOS SE GUARDAN EN LA REVIEW
            review.comments = comments;

            return review;
          })
        );
      });

      forkJoin(procesos).subscribe((reviewsCompletas) => {
        this.reviews = reviewsCompletas;
      });
    });
  }
  toggleLike(review: any) {
    if (!this.userLoggedIn || !this.userId) {
      alert("Debes estar logueado para dar like.");
      return;
    }

    this.likeService.toggleLike(this.userId, review.id).subscribe((res) => {
      if (res.liked) {
        review.likesCount++;
        review.likedByUser = true;
      } else {
        review.likesCount--;
        review.likedByUser = false;
      }
    });
  }

addComment(event: Event, review: any) {
  event.preventDefault();

  const control = this.getControl(review.id!);
  const text = control.value?.trim();

  if (!text) return;
  if (!this.userId) return;

  const newComment: ReviewComment = {
    idReview: review.id!,
    idProfile: this.userId,
    comment: text
  };

  this.comentService.addComment(newComment).subscribe((saved) => {
    saved.userName = this.userProfile?.username || 'Tú';

    review.comments.push(saved);

    control.reset();
  });
}
  setStarRating(star: number) {
    this.starRating = star;
    this.reviewForm.controls.score.setValue(star);
  }

  private trackUser = effect(() => {
    const user = this.authService.getActiveUser()();

    if (user?.id) {
      this.userId = user.id;
      this.userLoggedIn = true;
      this.loadReviews();   // ⬅ cargar AFTER userId
    } else {
      this.userId = undefined;
      this.userLoggedIn = false;
      this.loadReviews();   // ⬅ igual cargamos pero sin likes
    }
  });

  // 🔵 ***VERSION SIN ngSubmit***
  addReview(event?: Event) {
    if (event) {
      event.preventDefault(); // evita recargar la página
    }

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    if (!this.userLoggedIn || this.userId === undefined) {
      alert('Debes estar logueado para dejar una reseña.');
      return;
    }

    const movieId = this.peliculaID();
    if (movieId === undefined) {
      console.error('No se encontró el ID de la película');
      return;
    }

    const newReviewData: Review = {
      idProfile: this.userId,
      idMovie: movieId,
      score: Number(this.reviewForm.value.score),
      description: this.reviewForm.value.description ?? '',
    };

    this.reviewService.addReview(newReviewData).subscribe(
      (response) => {
        this.reviews.push(response);
        this.reviewForm.reset();
        this.starRating = 0;
      },
      (error) => {
        console.error('Error al agregar la reseña:', error);
      }
    );
  }

  deleteReview(reviewId: number) {
    this.reviewService.deleteReviewById(reviewId).subscribe(
      () => {
        this.reviews = this.reviews.filter((review) => review.id !== reviewId);
      },
      (error) => {
        console.error('Error al eliminar la reseña:', error);
      }
    );
  }

}
