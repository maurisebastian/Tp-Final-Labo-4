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

  // Obtiene SOLO los reportes con estado "pending"
  getPendingReports(): Observable<ReviewReport[]> {
    return this.http.get<ReviewReport[]>(`${this.baseUrl}?status=pending`);
  }

  // Crear un nuevo reporte
  addReport(
    report: Omit<ReviewReport, 'id' | 'createdAt' | 'status'>
  ): Observable<ReviewReport> {
    const body: ReviewReport = {
      ...report,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    return this.http.post<ReviewReport>(this.baseUrl, body);
  }

  // Cambiar el estado del reporte (resolved o dismissed)
  updateStatus(
    id: string | number,
    status: ReviewReport['status']
  ): Observable<ReviewReport> {
    return this.http.patch<ReviewReport>(`${this.baseUrl}/${id}`, { status });
  }
}
