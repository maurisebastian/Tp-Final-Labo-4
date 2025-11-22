// src/app/Components/admin-reports/admin-reports.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReviewReport } from '../../Interfaces/profilein';
import { ReviewReportService } from '../../Services/review-report.service';


@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.css',
})
export class AdminReports {
  private reportService = inject(ReviewReportService);

  reports: ReviewReport[] = [];
  isLoading = false;
  errorMsg = '';

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.reportService.getPendingReports().subscribe({
      next: (reports: ReviewReport[]) => {
        this.reports = reports;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMsg = 'Error cargando reportes.';
        this.isLoading = false;
      },
    });
  }

  changeStatus(report: ReviewReport, status: 'resolved' | 'dismissed'): void {
    if (!report.id) return;

    this.reportService.updateStatus(String(report.id), status).subscribe({
      next: () => {
        this.reports = this.reports.filter((r) => r.id !== report.id);
      },
      error: (err: any) => {
        console.error(err);
        alert('No se pudo actualizar el estado del reporte.');
      },
    });
  }
}