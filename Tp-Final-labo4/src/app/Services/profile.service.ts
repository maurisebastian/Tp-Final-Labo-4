import { Injectable, inject, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of, forkJoin } from 'rxjs';
import { Profile } from '../Interfaces/profilein';
import { AuthService } from '../auth/auth-service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private baseUrl = 'http://localhost:3000/profiles';
  private readonly STORAGE_KEY = 'activeUser';

  private http = inject(HttpClient);
  private auth = inject(AuthService);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    // 🔄 Al crear el servicio, intento restaurar el usuario desde localStorage
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        try {
          const user = JSON.parse(raw) as Profile;
          // Setea el usuario activo en el AuthService
          this.auth.login(user);
        } catch {
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    }
  }

  // ======================
  //   HELPER LOCALSTORAGE
  // ======================

  private saveActiveUser(user: Profile) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignoramos errores de storage
    }
  }

  private clearActiveUser() {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // ignoramos errores
    }
  }

  // Si querés un logout centralizado:
  logout() {
    this.auth.logout();
    this.clearActiveUser();
  }

  // =============
  //   MÉTODOS API
  // =============

  getUserById(id: number) {
    return this.http.get<Profile>(`${this.baseUrl}/${id}`);
  }

  signup(user: Profile) {
    return this.http.post<Profile>(this.baseUrl, user).pipe(
      map(u => {
        this.auth.login(u);        // usuario activo en memoria
        this.saveActiveUser(u);    // guardar en localStorage
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
            this.auth.login(u);     // memoria
            this.saveActiveUser(u); // localStorage
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

  updateProfile(user: Profile) {
    if (!user.id) return of(false);

    return this.http.put<Profile>(`${this.baseUrl}/${user.id}`, user).pipe(
      map(u => {
        this.auth.login(u);       // actualiza usuario activo
        this.saveActiveUser(u);   // actualiza en localStorage
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
}
