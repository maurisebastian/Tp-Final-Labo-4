import { Component, effect, inject, input } from '@angular/core';

import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, map, of, switchMap, catchError } from 'rxjs';

import {
  Profile,
  Review,
  ReviewComment,
} from '../../Interfaces/profilein';

import { ReviewService } from '../../Services/review.service';
import { ProfileService } from '../../Services/profile.service';
import { AuthService } from '../../auth/auth-service';
import { ReviewLikeService } from '../../Services/review-like.service';
import { ComentService } from '../../Services/coment-service';
import { ReviewReportService } from '../../Services/review-report.service';
import { NotificationService } from '../../Services/notification-service';
import { AppNotification } from '../../Interfaces/app-notification';


@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [ReactiveFormsModule],
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
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);



  // ID de la película que viene desde MovieReview
  peliculaID = input<number | string>();
  ;

  activeUser = this.authService.getActiveUser();
  userAlreadyReviewed = false;
  existingReview: Review | null = null;

  // estado de usuario
  userId: string | number | null = null;
  userLoggedIn = false;
  isAdmin = false;

  // estado de reseñas y perfil propio
  reviews: any[] = [];
  userProfile: Profile | undefined;

  // form de reseña
  reviewForm = this.fb.nonNullable.group({
    score: this.fb.nonNullable.control(0, Validators.required),
    description: ['', [Validators.required, Validators.minLength(5)]],
  });

  // controles para comentarios (uno por reseña)
  commentControls: { [key: string]: FormControl } = {};

  starRating = 0;

  // ====== CONTROLES DE COMENTARIOS ======
  getControl(reviewId: string | number): FormControl {
    const key = String(reviewId);
    if (!this.commentControls[key]) {
      this.commentControls[key] = new FormControl('');
    }
    return this.commentControls[key];
  }

  // ====== CARGA DE RESEÑAS + USUARIO + COMENTARIOS ======
  loadReviews() {
    const id = this.peliculaID();
    if (!id) return;

    this.reviewService.getReviewsByMovieId(id).subscribe((reviews) => {
      // 🔹 Filtramos por seguridad (por si viniera algo mezclado)
      reviews = reviews.filter(r => String(r.idMovie) === String(id));

      if (!reviews || reviews.length === 0) {
        this.reviews = [];
        this.userAlreadyReviewed = false;
        this.existingReview = null;
        return;
      }

      const procesos = reviews.map((review: any) => {
        return forkJoin({
          // 🔹 Usuario de la reseña (con fallback si fue eliminado)
          user: this.profileService.getUserById(review.idProfile as any).pipe(
            catchError(err => {
              console.warn('No se encontró el perfil de la reseña', review.idProfile, err);
              return of({
                id: review.idProfile,
                username: 'Usuario eliminado',
                password: '',
                role: 'user',
              } as Profile);
            })
          ),

          // 🔹 Likes totales
          likes: this.likeService.getLikesByReview(review.id as any),

          // 🔹 Si el usuario activo dio like
          likedByUser: this.userId != null
            ? this.likeService.getLike(this.userId as any, review.id as any)
            : of([]),

          // 🔹 Comentarios crudos
          commentsRaw: this.comentService.getComments(review.id as any),
        }).pipe(
          switchMap(({ user, likes, likedByUser, commentsRaw }) => {
            // 🔹 Resolver usuarios de cada comentario
            const comments$ = (commentsRaw && commentsRaw.length > 0)
              ? forkJoin(
                commentsRaw.map((c: any) =>
                  this.profileService.getUserById(c.idProfile as any).pipe(
                    // 👉 Usamos la corrección de tu compañero:
                    // idProfile viene del usuario encontrado
                    map((commentUser: any) => ({
                      ...c,
                      userName: commentUser?.username ?? 'Usuario eliminado',
                      idProfile: commentUser?.id ?? c.idProfile,
                    })),
                    // 👉 Y mantenemos tu fallback si falla
                    catchError(err => {
                      console.warn('No se encontró el perfil del comentario', c.idProfile, err);
                      return of({
                        ...c,
                        userName: 'Usuario eliminado',
                        idProfile: c.idProfile,
                      });
                    })
                  )
                )
              )
              : of([]);

            return comments$.pipe(
              map((comments) => ({
                ...review,
                userName: user.username ?? 'Usuario eliminado',
                likesCount: likes.length,
                likedByUser: likedByUser.length > 0,
                comments,
              }))
            );
          })
        );
      });

      forkJoin(procesos).subscribe((reviewsCompletas) => {

        //  Orden: más likes primero, y si empatan, más nueva primero
        this.reviews = [...reviewsCompletas].sort((a: any, b: any) => {
          const likesDiff = (b.likesCount ?? 0) - (a.likesCount ?? 0);
          if (likesDiff !== 0) return likesDiff;

          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        });

        // ¿El usuario ya reseñó esta película?
        if (this.userId != null) {
          const match = this.reviews.find(r => String(r.idProfile) === String(this.userId));
          this.userAlreadyReviewed = !!match;
          this.existingReview = match ?? null;
        }
      });
    });
  }



  // ====== LIKE A RESEÑA ======
  toggleLike(review: any) {
    if (!this.userLoggedIn || this.userId == null) {
      alert('Debes estar logueado para dar like.');
      return;
    }

    this.likeService.toggleLike(this.userId as any, review.id as any).subscribe((res) => {
      if (res.liked) {
        review.likesCount++;
        review.likedByUser = true;

        //  Notificar el like 
        this.notifyReviewOwner({
          review,
          type: 'like',
          message: `${this.userProfile?.username ?? 'Un usuario'} le dio like a tu reseña.`,
        });


      } else {
        review.likesCount--;
        review.likedByUser = false;
      }

      // reordenar like
      this.sortReviewsByLikes();
    });
  }

  // reordenar al dar like
  private sortReviewsByLikes() {
    this.reviews = [...this.reviews].sort((a: any, b: any) => {
      const likesDiff = (b.likesCount ?? 0) - (a.likesCount ?? 0);
      if (likesDiff !== 0) return likesDiff;
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    });
  }

  // ====== AGREGAR COMENTARIO ======
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

      // sumar señal por comentar
      const movieIdRaw = this.peliculaID();

      
    

      //  Notificar el comentario
      this.notifyReviewOwner({
        review,
        type: 'comment',
        message: `${this.userProfile?.username ?? 'Un usuario'} comentó tu reseña.`,
      });


    });
  }

  // ====== ESTRELLAS ======
  setStarRating(star: number) {
    this.starRating = star;
    this.reviewForm.controls.score.setValue(star);
  }

  // ====== SEGUIMIENTO DE USUARIO ACTIVO (signal) ======
  private trackUser = effect(() => {
    const user = this.authService.getActiveUser()();

    if (user?.id) {
      this.userId = user.id as any;
      this.userLoggedIn = true;
      this.isAdmin = user.role === 'admin' || user.role === 'superadmin';

      // opcional: cargar perfil propio para usar username en comentarios
      this.profileService.getUserById(this.userId as any)
        .subscribe(p => this.userProfile = p);

      this.loadReviews();
    } else {
      this.userId = null;
      this.userLoggedIn = false;
      this.isAdmin = false;
      this.userProfile = undefined;
      this.loadReviews();
    }
  });

  // ====== AGREGAR RESEÑA ======
  addReview(event?: Event) {
    if (event) event.preventDefault();

    if (this.isAdmin) {
      alert("Los administradores no pueden dejar reseñas.");
      return;
    }

    if (this.userAlreadyReviewed) {
      alert("Solo puedes dejar una reseña por película.");
      return;
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
      idProfile: this.userId!,
      idMovie: movieId as any,   //  opcional: casteo para que no rompa
      score: Number(this.reviewForm.value.score),
      description: this.reviewForm.value.description ?? '',
    };


    this.reviewService.addReview(newReviewData).subscribe({
      next: () => {
        //  Esto hace que el formulario desaparezca sin recargar
        this.loadReviews();
        this.reviewForm.reset();
        this.starRating = 0;
      },
      error: (err) => console.error('Error al agregar la reseña:', err),
    });
  }
  // ====== ELIMINAR RESEÑA ======
  deleteReview(reviewId: string | number) {
    this.reviewService.deleteReviewById(reviewId as any).subscribe({
      next: () => {
        this.reviews = this.reviews.filter((review) => review.id !== reviewId);
      },
      error: (err) => console.error('Error al eliminar la reseña:', err),
    });
  }

  isEditing = false;
  editReviewId: number | string | null = null;
  editingReview: any = null;
  startEdit(review: any) {
    this.isEditing = true;

    this.editReviewId = review.id;
    this.editingReview = review;
    this.starRating = review.score;
    this.reviewForm.setValue({
      score: review.score,
      description: review.description
    });

    // Esperar a que el DOM actualice y luego scrollear
    setTimeout(() => {
      const form = document.getElementById('editForm');
      if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }

  cancelEdit() {
    this.isEditing = false;
    this.editReviewId = null;
    this.editingReview = null;
    this.reviewForm.reset();
    this.starRating = 0;
  }
  saveEdit() {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    const updatedReview: Review = {
      id: this.editReviewId!,
      idProfile: this.userId!,
      idMovie: this.peliculaID()!,
      score: this.reviewForm.value.score!,
      description: this.reviewForm.value.description!
    };
    this.reviewService.updateReview(updatedReview).subscribe({
      next: () => {
        this.isEditing = false;
        this.editReviewId = null;
        this.editingReview = null;
        this.loadReviews();
        this.reviewForm.reset();
        this.starRating = 0;
      },
      error: (err) => console.error('Error al editar reseña:', err),
    });
  }

  // ====== REPORTAR RESEÑA ======
  reportReview(review: any) {
    if (!this.userLoggedIn || this.userId == null) {
      alert('Debes estar logueado para reportar una reseña.');
      return;
    }

    const reason = prompt('¿Por qué querés reportar esta reseña?');
    if (!reason || !reason.trim()) return;

    this.reportService.addReport({
      type: 'review',
      idReview: review.id,
      idComment: undefined,
      idMovie: this.peliculaID(),  // ahora acepta string o number
      reporterId: this.userId!,    // mejor asegurar con !
      reason: reason.trim(),
    }).subscribe({
      next: () => alert('Tu reporte fue enviado al administrador.'),
      error: (err) => {
        console.error('Error al reportar reseña', err);
        alert('Ocurrió un error al enviar el reporte.');
      },
    });

  }

  // ====== REPORTAR COMENTARIO ======
  reportComment(review: any, comment: any) {
    if (!this.userLoggedIn || this.userId == null) {
      alert('Debes estar logueado para reportar un comentario.');
      return;
    }

    const reason = prompt('¿Por qué querés reportar este comentario?');
    if (!reason || !reason.trim()) return;

    this.reportService.addReport({
      type: 'comment',
      idReview: review.id,
      idComment: comment.id,
      idMovie: this.peliculaID(),
      reporterId: this.userId,
      reason: reason.trim(),
    }).subscribe({
      next: () => alert('Tu reporte fue enviado al administrador.'),
      error: (err) => {
        console.error('Error al reportar comentario', err);
        alert('Ocurrió un error al enviar el reporte.');
      },
    });
  }

  // ====== NAVEGAR AL PERFIL DEL USUARIO ======
  // ====== NAVEGAR AL PERFIL DEL USUARIO ======
  goToUserProfile(idProfile: string | number) {
    console.log('🔵 goToUserProfile -> idProfile recibido:', idProfile, 'tipo:', typeof idProfile);

    if (!idProfile) return;

    const activeUser = this.authService.getActiveUser()();
    const activeId = activeUser?.id;          // también es string en tu JSON

    // si es mi propio usuario → voy a mi perfil privado
    if (activeId && String(activeId) === String(idProfile)) {
      console.log('🟢 Es el usuario activo, navegando a /profile-detail');
      this.router.navigate(['/profile-detail']);
    } else {
      // otro usuario → perfil público
      console.log('🟡 Navegando al perfil público de:', idProfile);
      this.router.navigate(['/profiles', idProfile]);
    }
  }

  //  ¿Puede reportar esta reseña?
  canReportReview(review: any): boolean {
    if (!this.userLoggedIn || this.userId == null) return false;

    // si querés que los admin nunca reporten:
    if (this.isAdmin) return false;

    // no puede reportar su propia reseña
    return String(review.idProfile) !== String(this.userId);
  }
  // ¿es mi comentario?
  isCommentOwner(comment: any): boolean {
    const active = this.authService.getActiveUser()();
    if (!active) return false;

    const currentUsername = (active.username || '').toLowerCase();
    const commentUsername = (comment.userName || '').toLowerCase();

    return currentUsername === commentUsername;
  }

  canReportComment(comment: any): boolean {
    if (!this.userLoggedIn) return false;
    // no reporto mi propio comentario
    return !this.isCommentOwner(comment);
  }

  deleteComment(review: any, comment: any) {
    this.comentService.deleteComment(comment.id).subscribe({
      next: () => {
        review.comments = review.comments.filter((c: any) => c.id !== comment.id);
      },
      error: (err) => console.error('Error al eliminar comentario:', err),
    });
  }

  private notifyReviewOwner(params: {
    review: any;
    type: 'like' | 'comment';
    message: string;
  }) {
    const fromUser = this.activeUser();
    const senderId = fromUser?.id ?? this.userId;

    const ownerId = params.review?.idProfile;
    const reviewId = params.review?.id;
    const movieId = params.review?.idMovie; // id pelicula

    // Evitar null/undefined
    if (senderId == null || ownerId == null || reviewId == null || movieId == null) {
      console.warn('Notificación cancelada: faltan ids', { senderId, ownerId, reviewId, movieId });
      return;
    }

    // No notificar a uno mismo (comparación segura)
    if (String(senderId) === String(ownerId)) return;

    const notif: AppNotification = {
      userId: ownerId as any,
      fromUserId: senderId as any,
      type: params.type,
      referenceId: reviewId as any,
      movieId: movieId as any, // id pelicula
      message: params.message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.notificationService.create(notif).subscribe({
      next: (saved) => console.log(' Notificación creada', saved),
      error: (err) => console.warn(' Error creando notificación', err),
    });
  }

}
