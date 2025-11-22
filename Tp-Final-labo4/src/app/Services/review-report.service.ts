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

  getPendingReports(): Observable<ReviewReport[]> {
    return this.http.get<ReviewReport[]>(`${this.baseUrl}?status=pending`);
  }

  updateStatus(
    id: string,
    status: ReviewReport['status']
  ): Observable<ReviewReport> {
    return this.http.patch<ReviewReport>(`${this.baseUrl}/${id}`, { status });
  }
}
