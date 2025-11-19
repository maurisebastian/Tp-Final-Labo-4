import { computed, Injectable, signal } from '@angular/core';
import { Profile } from '../Interfaces/profilein';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly activeUser = signal<Profile | undefined>(undefined);
  public readonly isLoggedIn = computed(() => this.activeUser() !== undefined);
  public readonly isAdmin = computed(() => {
    const role = this.activeUser()?.role;
    return role === 'admin' || role === 'superadmin';
  });

  public getActiveUser() {
    return this.activeUser;
  }

  login(user: Profile) {
    if (user) {
      this.activeUser.set(user);
    }

  }
  logout() {

    this.activeUser.set(undefined);
  }



}
