import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of, forkJoin } from 'rxjs';
import { Profile } from '../Interfaces/profilein';
import { AuthService } from '../auth/auth-service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private baseUrl = 'http://localhost:3000/profiles';

  private http = inject(HttpClient);
  private auth = inject(AuthService);

  // =============
  //   MÉTODOS API
  // =============

  getUserById(id: number | string) {
    return this.http.get<Profile>(`${this.baseUrl}/${id}`);
  }

  signup(user: Profile) {
    return this.http.post<Profile>(this.baseUrl, user).pipe(
      map(u => {
        // AuthService se encarga de memoria + localStorage
        this.auth.login(u);
        return true;
      }),
      catchError(() => of(false))
    );
  }

  login(credentials: { username: string; password: string }) {
    return this.http
      .get<Profile[]>(`${this.baseUrl}?username=${encodeURIComponent(credentials.username)}`)
      .pipe(
        map(([u]) => {
          if (u && u.password === credentials.password) {
            this.auth.login(u); // también persiste en storage
            return true;
          }
          return false;
        }),
        catchError(() => of(false))
      );
  }

  findByUsername(username: string) {
    return this.http.get<Profile[]>(`${this.baseUrl}?username=${encodeURIComponent(username)}`);
  }

  findByEmail(email: string) {
    return this.http.get<Profile[]>(`${this.baseUrl}?email=${encodeURIComponent(email)}`);
  }

  checkUsernameAndEmail(username: string, email: string) {
    return forkJoin({
      usernameMatches: this.findByUsername(username),
      emailMatches: this.findByEmail(email)
    }).pipe(
      map(({ usernameMatches, emailMatches }) => ({
        usernameExists: usernameMatches.length > 0,
        emailExists: emailMatches.length > 0
      })),
      catchError(() =>
        of({ usernameExists: false, emailExists: false })
      )
    );
  }

  updateProfile(user: Profile, updateSession: boolean = true) {
    if (!user.id) return of(false);

    return this.http.put<Profile>(`${this.baseUrl}/${user.id}`, user).pipe(
      map(u => {
        if (updateSession) {
          // refresco usuario activo en AuthService
          this.auth.login(u);
        }
        return true;
      }),
      catchError(() => of(false))
    );
  }

  getAllUsers() {
    return this.http.get<Profile[]>(this.baseUrl).pipe(
      catchError(() => of([]))
    );
  }

  deleteUser(id: number) {
    // proteger superadmin
    if (id === 1) return of(false);

    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  createAdmin(data: { username: string; password: string; email: string }) {
    const newAdmin: Profile = {
      username: data.username,
      password: data.password,
      email: data.email,
      role: 'admin'
    };

    return this.http.post<Profile>(this.baseUrl, newAdmin).pipe(
      catchError(() => of(null as any))
    );
  }

  // opcional: wrapper si en algún lado usás ProfileService.logout()
  logout() {
    this.auth.logout(); // AuthService borra memoria + localStorage
  }
}
