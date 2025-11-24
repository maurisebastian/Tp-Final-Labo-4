// src/app/Services/profile.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of, forkJoin, tap, Observable } from 'rxjs';
import { Profile } from '../Interfaces/profilein';
import { AuthService } from '../auth/auth-service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {

  private readonly baseUrl = 'http://localhost:3000/profiles';

  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  // ---------- LECTURA ----------
  getUserById(id: string | number) {
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

  // ---------- AUTH ----------
  signup(user: Profile) {
    return this.http.post<Profile>(this.baseUrl, user).pipe(
      map((u) => {
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
            this.auth.login(u);
            return true;
          }
          return false;
        }),
        catchError(() => of(false))
      );
  }

  logout() {
    this.auth.logout();
  }

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

  // ---------- UPDATE GENERAL (editar perfil) ----------
  // Usado por SIGNUP en modo EDITAR PERFIL y por AdminUserEdit
updateProfile(user: Profile, updateActiveUser: boolean = true) {
  if (!user.id) {
    console.error('❌ El usuario no tiene id, no puedo actualizar', user);
    return of(false);
  }

  return this.http
    .patch<Profile>(`${this.baseUrl}/${user.id}`, user)
    .pipe(
      tap((u) => {
        console.log('🟢 Usuario actualizado en JSON:', u);

        // si hace falta, también actualizamos el usuario activo
        if (updateActiveUser) {
          this.auth.login(u);
        }
      }),
      map(() => true),
      catchError((err) => {
        console.error('❌ Error al actualizar usuario', err);
        return of(false);
      })
    );
}


  // ---------- SOLO FAVORITE GENRES (pantalla select-genres) ----------
 /* updateFavoriteGenres(userId: string, favoriteGenres: number[]) {

    const payload = { favoriteGenres };

    console.log(`🟢 PATCH -> ${this.baseUrl}/${userId}`, payload);

    return this.http
      .patch<Profile>(`${this.baseUrl}/${userId}`, payload)
      .pipe(
        tap((resp) => {
          console.log('🟢 Respuesta JSON-server:', resp);
        }),
        map(() => true),
        catchError((err) => {
          console.error('❌ Error al actualizar favoriteGenres:', err);
          return of(false);
        })
      );
  }*/

       updateFavoritePreferences(
    profileId: string,
    favoriteGenres: number[],
    favoriteActors: number[]
  ): Observable<boolean> {
    return this.http
      .patch<Profile>(`${this.baseUrl}/${profileId}`, {
        favoriteGenres,
        favoriteActors,
      })
      .pipe(
        map(() => true),
        catchError(err => {
          console.error('Error actualizando preferencias:', err);
          return of(false);
        })
      );
  }


  deleteUser(id: string) {
    if (id === '1') return of(false);

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
      role: 'admin',
      firstName: 'Admin',
      lastName: 'Global',
      favoriteGenres: [],
      date: '1990-01-01',
      cel: '00000000',
    };

    return this.http.post<Profile>(this.baseUrl, newAdmin).pipe(
      catchError(() => of(null as any))
    );
  }

  // ---------- ACTUALIZAR VISIBILIDAD DEL PERFIL (isPublic) ----------
updateProfileVisibility(userId: string | number, isPublic: boolean) {
  const payload = { isPublic };

  return this.http
    .patch<Profile>(`${this.baseUrl}/${userId}`, payload)
    .pipe(
      tap((updated) => {
        console.log(' Visibilidad actualizada:', updated);

        // Si el que cambia es el usuario activo → actualizar señal + localStorage
        const active = this.auth.getActiveUser()();
        if (active && active.id === userId) {
          this.auth.login(updated);
        }
      }),
      map(() => true),
      catchError((err) => {
        console.error(' Error al cambiar visibilidad del perfil:', err);
        return of(false);
      })
    );
}
}
