import { computed, Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Profile } from '../Interfaces/profilein';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly STORAGE_KEY = 'activeUser';

  private readonly activeUser = signal<Profile | undefined>(undefined);

  public readonly isLoggedIn = computed(() => this.activeUser() !== undefined);

  public readonly isAdmin = computed(() => {
    const role = this.activeUser()?.role;
    return role === 'admin' || role === 'superadmin';
  });

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    // Restaurar usuario guardado al iniciar la app
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        try {
          const user = JSON.parse(raw) as Profile;
          this.activeUser.set(user);
        } catch {
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    }
  }

  public getActiveUser() {
    return this.activeUser;
  }

  login(user: Profile) {
    if (!user) return;

    this.activeUser.set(user);

    // Guardar en localStorage
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      } catch {}
    }
  }

  logout() {
    this.activeUser.set(undefined);

    //  Borrar de localStorage
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch {}
    }
  }
}
