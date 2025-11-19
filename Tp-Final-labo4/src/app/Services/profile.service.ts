import { Injectable, inject, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of, forkJoin } from 'rxjs';
import { Profile } from '../Interfaces/profilein';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private baseUrl = 'http://localhost:3000/profiles';
  private http = inject(HttpClient);

  activeUser = signal<Profile | undefined>(undefined);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (this.isBrowser()) {
      const stored = localStorage.getItem('activeUser');
      if (stored) {
        try {
          const user: Profile = JSON.parse(stored);
          this.activeUser.set(user);
        } catch {
          localStorage.removeItem('activeUser');
        }
      }
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private setActiveUser(user?: Profile) {
    this.activeUser.set(user);

    if (!this.isBrowser()) return;

    if (user)
      localStorage.setItem('activeUser', JSON.stringify(user));
    else
      localStorage.removeItem('activeUser');
  }

  auth() {
    return this.activeUser;
  }

  isSuperAdmin() {
    return this.activeUser()?.role === 'superadmin';
  }

 isAdmin(): boolean {
  const u = this.activeUser();
  return !!u && (u.role === 'admin' || u.role === 'superadmin');
}


  getUserById(id: number) {
    return this.http.get<Profile>(`${this.baseUrl}/${id}`);
  }

  signup(user: Profile) {
    return this.http.post<Profile>(this.baseUrl, user).pipe(
      map(u => {
        this.setActiveUser(u);
        return true;
      }),
      catchError(() => of(false))
    );
  }

  login(credentials: { username: string; password: string }) {
    return this.http.get<Profile[]>(`${this.baseUrl}?username=${encodeURIComponent(credentials.username)}`)
      .pipe(
        map(([u]) => {
          if (u && u.password === credentials.password) {
            this.setActiveUser(u);
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

  logout() {
    this.setActiveUser(undefined);
    return of(true);
  }

  updateProfile(user: Profile) {
    if (!user.id) return of(false);

    return this.http.put<Profile>(`${this.baseUrl}/${user.id}`, user).pipe(
      map(u => {
        this.setActiveUser(u);
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

  //  SUPERADMIN PROTEGIDO
  deleteUser(id: number) {
    if (id === 1) {
      return of(false); // no borrar superadmin
    }

    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  //  CREAR ADMINS CON VALIDACIÓN
  //  CREAR ADMIN (simple, sin lógica mágica)
createAdmin(data: { username: string; password: string; email: string }) {
  const newAdmin: Profile = {
    username: data.username,
    password: data.password,
    email: data.email,
    role: 'admin'
  };

  return this.http.post<Profile>(this.baseUrl, newAdmin).pipe(
    catchError(() => of(null as any))   // si falla el POST devolvemos null
  );
}

}
