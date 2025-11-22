import { Component, effect, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { forkJoin, map, of } from 'rxjs';

import {
  Profile,
  Review,
  ReviewComment,
} from '../../Interfaces/profilein';

import { ReviewService } from '../../Services/review.service';
import { ProfileService } from '../../Services/profile.service';
import { AuthService } from '../../auth/auth-service';
import { ReviewLikeService } from '../../Services/review-like-service';
import { ComentService } from '../../Services/coment-service';
import { ReviewReportService } from '../../Services/review-report.service';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './review-list.html',
  styleUrl: './review-list.css',
})
export class ReviewList {

  private readonly reviewService = inject(ReviewService);
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  private readonly likeService = inject(ReviewLikeService);
  private readonly comentService = inject(ComentService);
  private readonly reportService = inject(ReviewReportService);

  protected fb = inject(FormBuilder);

  // ID de la película que viene desde MovieReview
  peliculaID = input<number>();

  // 👇 AHORA SOLO number | null
  userId: number | null = null;
  userLoggedIn = false;
  isAdmin = false;

  reviews: any[] = [];
  userProfile: Profile | undefined;

  commentControls: { [key: string]: FormControl } = {};

  getControl(reviewId: string | number): FormControl {
    const key = String(reviewId);
    if (!this.commentControls[key]) {
      this.commentControls[key] = new FormControl('');
    }
    return this.commentControls[key];
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

  ngOnInit(): void {}

  loadReviews() {
    const id = this.peliculaID();
    if (!id) return;

    this.reviewService.getReviewsByMovieId(id).subscribe((reviews) => {
      const procesos = reviews.map((review: any) => {
        return forkJoin({
          user: this.profileService.getUserById(review.idProfile as any),
          likes: this.likeService.getLikesByReview(review.id as any),
          likedByUser: this.userId != null
            ? this.likeService.getLike(this.userId as any, review.id as any)
            : of([]),
          comments: this.comentService.getComments(review.id as any),
        }).pipe(
          map(({ user, likes, likedByUser, comments }) => {
            review.userName = user.username;
            review.likesCount = likes.length;
            review.likedByUser = likedByUser.length > 0;
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
    if (!this.userLoggedIn || this.userId == null) {
      alert('Debes estar logueado para dar like.');
      return;
    }

    this.likeService.toggleLike(this.userId as any, review.id as any).subscribe((res) => {
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
    if (this.userId == null) return;

    const newComment: ReviewComment = {
      idReview: review.id!,
      idProfile: this.userId,
      comment: text,
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
      this.userId = user.id as number;
      this.userLoggedIn = true;
      this.isAdmin =
        user.role === 'admin' || user.role === 'superadmin';
      this.loadReviews();
    } else {
      this.userId = null;
      this.userLoggedIn = false;
      this.isAdmin = false;
      this.loadReviews();
    }
  });

  addReview(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    if (!this.userLoggedIn || this.userId == null) {
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

  deleteReview(reviewId: string | number) {
    this.reviewService.deleteReviewById(reviewId as any).subscribe(
      () => {
        this.reviews = this.reviews.filter(
          (review) => review.id !== reviewId
        );
      },
      (error) => {
        console.error('Error al eliminar la reseña:', error);
      }
    );
  }

    reportReview(review: any) {
    if (!this.userLoggedIn || this.userId == null) {
      alert('Debes estar logueado para reportar una reseña.');
      return;
    }

    const reason = prompt('¿Por qué querés reportar esta reseña?');
    if (!reason || !reason.trim()) return;

    this.reportService
      .addReport({
        type: 'review',
        idReview: review.id,
        idComment: undefined,
        idMovie: this.peliculaID(),
        reporterId: this.userId,
        reason: reason.trim(),
      })
      .subscribe({
        next: () => alert('Tu reporte fue enviado al administrador.'),
        error: (err) => {
          console.error('Error al reportar reseña', err);
          alert('Ocurrió un error al enviar el reporte.');
        },
      });
  }

  reportComment(review: any, comment: any) {
    if (!this.userLoggedIn || this.userId == null) {
      alert('Debes estar logueado para reportar un comentario.');
      return;
    }

    const reason = prompt('¿Por qué querés reportar este comentario?');
    if (!reason || !reason.trim()) return;

    this.reportService
      .addReport({
        type: 'comment',
        idReview: review.id,
        idComment: comment.id,
        idMovie: this.peliculaID(),
        reporterId: this.userId,
        reason: reason.trim(),
      })
      .subscribe({
        next: () => alert('Tu reporte fue enviado al administrador.'),
        error: (err) => {
          console.error('Error al reportar comentario', err);
          alert('Ocurrió un error al enviar el reporte.');
        },
      });
  }

  starRating = 0;
}
