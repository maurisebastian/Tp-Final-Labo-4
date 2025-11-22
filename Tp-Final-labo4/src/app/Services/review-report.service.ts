// src/app/Services/review-report.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewReport } from '../Interfaces/profilein';

@Injectable({
  providedIn: 'root',
})
export class ReviewReportService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/reviewReports';

  // 🔹 Reportes pendientes para el admin
  getPendingReports(): Observable<ReviewReport[]> {
    return this.http.get<ReviewReport[]>(`${this.baseUrl}?status=pending`);
  }

  // 🔹 Crear un nuevo reporte (review o comment)
  addReport(
    report: Omit<ReviewReport, 'id' | 'createdAt' | 'status'>
  ): Observable<ReviewReport> {
    const body = {
      ...report,
      createdAt: new Date().toISOString(),
      status: 'pending' as ReviewReport['status'],
    };

    return this.http.post<ReviewReport>(this.baseUrl, body);
  }

  // 🔹 Cambiar estado del reporte
  updateStatus(
    id: string | number,
    status: ReviewReport['status']
  ): Observable<ReviewReport> {
    return this.http.patch<ReviewReport>(`${this.baseUrl}/${id}`, { status });
  }

  // 🔹 Reportes hechos por un usuario (para mostrar en su perfil privado)
  getReportsByUser(profileId: number): Observable<ReviewReport[]> {
    // filtramos por reporterId, que es el id del usuario que reportó
    return this.http.get<ReviewReport[]>(
      `${this.baseUrl}?reporterId=${profileId}`
    );
  }
}
