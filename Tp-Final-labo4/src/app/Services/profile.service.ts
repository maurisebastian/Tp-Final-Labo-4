import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of, forkJoin } from 'rxjs';
import { Profile } from '../Interfaces/profilein';
import { AuthService } from '../auth/auth-service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  // ======================
  //  CONFIGURACIÓN BÁSICA
  // ======================
  private readonly baseUrl = 'http://localhost:3000/profiles';

  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  // ======================
  //  MÉTODOS DE LECTURA
  // ======================

  getUserById(id: number | string) {
    return this.http.get<Profile>(`${this.baseUrl}/${id}`);
  }

  getAllUsers() {
    return this.http.get<Profile[]>(this.baseUrl).pipe(
      catchError(() => of([]))
    );
  }

  findByUsername(username: string) {
    return this.http.get<Profile[]>(
      `${this.baseUrl}?username=${encodeURIComponent(username)}`
    );
  }

  findByEmail(email: string) {
    return this.http.get<Profile[]>(
      `${this.baseUrl}?email=${encodeURIComponent(email)}`
    );
  }

  // ======================
  //  AUTH / SIGNUP / LOGIN
  // ======================

  signup(user: Profile) {
    return this.http.post<Profile>(this.baseUrl, user).pipe(
      map((u) => {
        // AuthService se encarga de memoria + localStorage
        this.auth.login(u);
        return true;
      }),
      catchError(() => of(false))
    );
  }

  login(credentials: { username: string; password: string }) {
    return this.http
      .get<Profile[]>(
        `${this.baseUrl}?username=${encodeURIComponent(credentials.username)}`
      )
      .pipe(
        map(([u]) => {
          if (u && u.password === credentials.password) {
            this.auth.login(u); // persiste usuario activo
            return true;
          }
          return false;
        }),
        catchError(() => of(false))
      );
  }

  logout() {
    this.auth.logout(); // borra usuario en memoria + storage
  }

  // ======================
  //  VALIDACIONES
  // ======================

  checkUsernameAndEmail(username: string, email: string) {
    return forkJoin({
      usernameMatches: this.findByUsername(username),
      emailMatches: this.findByEmail(email),
    }).pipe(
      map(({ usernameMatches, emailMatches }) => ({
        usernameExists: usernameMatches.length > 0,
        emailExists: emailMatches.length > 0,
      })),
      catchError(() =>
        of({ usernameExists: false, emailExists: false })
      )
    );
  }

  // ======================
  //  CRUD DE PERFIL
  // ======================

  updateProfile(user: Profile, updateSession: boolean = true) {
    if (!user.id) return of(false);

    return this.http.put<Profile>(`${this.baseUrl}/${user.id}`, user).pipe(
      map((u) => {
        if (updateSession) {
          this.auth.login(u); // refresca usuario en sesión
        }
        return true;
      }),
      catchError(() => of(false))
    );
  }

  deleteUser(id: number) {
    // proteger usuario superadmin
    if (id === 1) return of(false);

    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  createAdmin(data: { username: string; password: string; email: string }) {
    // Admin por defecto con los campos requeridos de Profile
    const newAdmin: Profile = {
      username: data.username,
      password: data.password,
      email: data.email,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'Global',
      favoriteGenres: [],    // gustos no usados para admin
      date: '1990-01-01',
      cel: '00000000',
    };

    return this.http.post<Profile>(this.baseUrl, newAdmin).pipe(
      catchError(() => of(null as any))
    );
  }
}
