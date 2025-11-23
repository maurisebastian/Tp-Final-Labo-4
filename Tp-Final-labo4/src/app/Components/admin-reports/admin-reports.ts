// src/app/Components/admin-reports/admin-reports.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth-service';

import {
  ReviewReport,
  Review,
  ReviewComment,
  Profile,
} from '../../Interfaces/profilein';

import { ReviewReportService } from '../../Services/review-report.service';
import { ReviewService } from '../../Services/review.service';
import { ComentService } from '../../Services/coment-service';
import { ProfileService } from '../../Services/profile.service';

type FullReport = ReviewReport & {
  reporterName?: string;
  reviewText?: string;
  commentText?: string;
};

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.css',
})
export class AdminReports {
  private reportService = inject(ReviewReportService);
  private reviewService = inject(ReviewService);
  private comentService = inject(ComentService);
  private profileService = inject(ProfileService);
  private router = inject(Router);
  private authService = inject(AuthService);
  isSuperAdmin = false;


  reports: FullReport[] = [];
  isLoading = false;
  errorMsg = '';

  ngOnInit(): void {
    const activeUser = this.authService.getActiveUser()();
    this.isSuperAdmin = activeUser?.role === 'superadmin';

    this.loadReports();
  }


  loadReports() {
    this.isLoading = true;
    this.errorMsg = '';

    // AHORA: traemos TODOS los reportes
    this.reportService.getAllReports().subscribe({
      next: (reports) => {
        if (reports.length === 0) {
          this.reports = [];
          this.isLoading = false;
          return;
        }

        const procesos = reports.map((rep) => {
          const user$ = this.profileService
            .getUserById(rep.reporterId as any)
            .pipe(
              catchError((err) => {
                console.warn('No se pudo cargar el usuario del reporte', err);
                return of(null as Profile | null);
              })
            );

          const review$ =
            rep.type === 'review' && rep.idReview != null
              ? this.reviewService.getReviewById(rep.idReview as any).pipe(
                catchError((err) => {
                  console.warn('No se pudo cargar la reseña del reporte', err);
                  return of(null as Review | null);
                })
              )
              : of(null);

          const comment$ =
            rep.type === 'comment' && rep.idComment != null
              ? this.comentService.getCommentById(rep.idComment as any).pipe(
                catchError((err) => {
                  console.warn('No se pudo cargar el comentario del reporte', err);
                  return of(null as ReviewComment | null);
                })
              )
              : of(null);


          return forkJoin({ user: user$, review: review$, comment: comment$ });
        });

        forkJoin(procesos).subscribe({
          next: (results: any[]) => {
            this.reports = reports.map((rep, idx) => {
              const { user, review, comment } = results[idx] as {
                user: Profile | null;
                review: Review | null;
                comment: ReviewComment | null;
              };

              return {
                ...rep,
                reporterName: user?.username,
                reviewText: review?.description,
                commentText: comment?.comment,
              };
            });

            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error en forkJoin de reportes', err);
            // No tocamos errorMsg, así igual mostramos lo que tengamos
            this.isLoading = false;
          },
        });


      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Error cargando reportes.';
        this.isLoading = false;
      },
    });
  }

  // 👉 NO los borramos: solo cambiamos el status
  changeStatus(report: FullReport, status: 'resolved' | 'dismissed' | 'pending') {
    if (!report.id) return;

    this.reportService.updateStatus(report.id, status).subscribe({
      next: (updated) => {
        this.reports = this.reports.map((r) =>
          r.id === updated.id ? { ...r, status: updated.status } : r
        );
      },
      error: (err) => {
        console.error(err);
        alert('No se pudo actualizar el estado del reporte.');
      },
    });
  }

  deleteReport(rep: FullReport) {
  const confirmDelete = confirm("¿Eliminar este reporte permanentemente?");
  if (!confirmDelete) return;

  this.reportService.deleteReport(rep.id).subscribe({
    next: () => {
      this.reports = this.reports.filter(r => r.id !== rep.id);
    },
    error: (err) => {
      console.error(err);
      alert("No se pudo eliminar el reporte.");
    }
  });
}


  goToMovie(report: FullReport) {
    if (!report.idMovie) return;
    this.router.navigate(['/movie-review', report.idMovie]);
  }

  goToProfile(report: FullReport) {
    if (!report.reporterId) return;
    // Ajustá el path si tu ruta es otra
    this.router.navigate(['/profile', report.reporterId]);
  }

  // Helpers para las 3 columnas
  get pendingReports(): FullReport[] {
    return this.reports.filter((r) => r.status === 'pending');
  }

  get resolvedReports(): FullReport[] {
    return this.reports.filter((r) => r.status === 'resolved');
  }

  get dismissedReports(): FullReport[] {
    return this.reports.filter((r) => r.status === 'dismissed');
  }
}
