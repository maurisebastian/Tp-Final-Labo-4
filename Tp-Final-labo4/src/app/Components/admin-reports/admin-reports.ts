// src/app/Components/admin-reports/admin-reports.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { Router } from '@angular/router';

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

  reports: FullReport[] = [];
  isLoading = false;
  errorMsg = '';

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    this.errorMsg = '';

    this.reportService.getPendingReports().subscribe({
      next: (reports) => {
        if (reports.length === 0) {
          this.reports = [];
          this.isLoading = false;
          return;
        }

        const procesos = reports.map((rep) => {
          const user$ = this.profileService.getUserById(rep.reporterId as any);

          const review$ =
            rep.type === 'review' && rep.idReview != null
              ? this.reviewService.getReviewById(rep.idReview as any)
              : of(null);

          const comment$ =
            rep.type === 'comment' && rep.idComment != null
              ? this.comentService.getCommentById(rep.idComment as any)
              : of(null);

          return forkJoin({ user: user$, review: review$, comment: comment$ });
        });

        forkJoin(procesos).subscribe({
          next: (results: any[]) => {
            this.reports = reports.map((rep, idx) => {
              const { user, review, comment } = results[idx] as {
                user: Profile;
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
            console.error(err);
            this.errorMsg =
              'Error cargando datos adicionales de los reportes.';
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

  changeStatus(report: FullReport, status: 'resolved' | 'dismissed') {
    if (!report.id) return;

    this.reportService.updateStatus(report.id, status).subscribe({
      next: () => {
        this.reports = this.reports.filter((r) => r.id !== report.id);
      },
      error: (err) => {
        console.error(err);
        alert('No se pudo actualizar el estado del reporte.');
      },
    });
  }

  goToMovie(report: FullReport) {
  if (!report.idMovie) return;
  this.router.navigate(['/movie-review', report.idMovie]);
}


}
