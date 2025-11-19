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

  // Usamos un Signal para guardar el usuario activo (logueado)
  activeUser = signal<Profile | undefined>(undefined);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Solo intento leer localStorage si estoy en el browser
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

  // Helper: saber si estoy en el navegador
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Manejo centralizado del usuario activo + localStorage
  private setActiveUser(user?: Profile) {
    this.activeUser.set(user);

    if (!this.isBrowser()) {
      // Si no estoy en el browser (SSR), no toco localStorage
      return;
    }

    if (user) {
      localStorage.setItem('activeUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('activeUser');
    }
  }

  // Devuelve el signal de usuario activo
  auth() {
    return this.activeUser;
  }

  // Obtener un usuario por id
  getUserById(id: string | number) {
    return this.http.get<Profile>(`${this.baseUrl}/${id}`);
  }

  // Registro de usuario nuevo
  signup(user: Profile) {
    return this.http.post<Profile>(this.baseUrl, user).pipe(
      map((u) => {
        this.setActiveUser(u);
        return true;
      }),
      catchError(() => of(false))
    );
  }

  // Login: busca por username y valida contraseña
  login(credentials: { username: string; password: string }) {
    return this.http
      .get<Profile[]>(`${this.baseUrl}?username=${encodeURIComponent(credentials.username)}`)
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

  // Busca usuarios por username
  findByUsername(username: string) {
    return this.http.get<Profile[]>(
      `${this.baseUrl}?username=${encodeURIComponent(username)}`
    );
  }

  // Busca usuarios por email
  findByEmail(email: string) {
    return this.http.get<Profile[]>(
      `${this.baseUrl}?email=${encodeURIComponent(email)}`
    );
  }

  /**
   * Devuelve si ya existe username o email en la base.
   * Retorna un objeto:
   * { usernameExists: boolean, emailExists: boolean }
   */
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
        of({
          usernameExists: false,
          emailExists: false,
        })
      )
    );
  }

  // Cerrar sesión
  logout() {
    this.setActiveUser(undefined);
    return of(true);
  }

  // Actualizar perfil reutilizando el mismo modelo
  updateProfile(user: Profile) {
    if (!user.id) {
      // Sin id no podemos actualizar en json-server
      return of(false);
    }

    return this.http.put<Profile>(`${this.baseUrl}/${user.id}`, user).pipe(
      map((u) => {
        this.setActiveUser(u);
        return true;
      }),
      catchError(() => of(false))
    );
  }
}
