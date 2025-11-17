import { inject, Injectable,signal } from '@angular/core';
import { Profile } from '../Interfaces/profilein';
import { HttpClient } from '@angular/common/http';
import{map,catchError,of}from'rxjs'


@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  
  private baseUrl = 'http://localhost:3000/profiles';
  
  private http = inject(HttpClient);

  //Usamos un Signal 
  activeUser = signal<Profile | undefined>(undefined);

  // Devuelve el signal 
  auth() {
    return this.activeUser;
  }

  signup(user: Profile) {
    return this.http.post<Profile>(this.baseUrl, user).pipe(
      map((u) => {
        this.activeUser.set(u); 
        return true;
      })
    );
  }

  login(user: Profile) {
    return this.http.get<Profile[]>(`${this.baseUrl}?username=${user.username}`).pipe(
      map(([u]) => {
        if (u && u.password === user.password) {
          this.activeUser.set(u); 
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  logout() {
    this.activeUser.set(undefined); 
    return of(true);
  }
}
  

