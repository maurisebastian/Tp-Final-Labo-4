import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Follow } from '../Interfaces/follow';
import { firstValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FollowService {


   private readonly baseUrl = 'http://localhost:3000/follows';

   private  readonly http = inject(HttpClient);

  // Seguir a un usuario
  follow(followerId: string | number, followingId: string | number) {
    const body: Follow = {
      followerId,
      followingId,
      createdAt: new Date().toISOString()
    };
    return firstValueFrom(this.http.post<Follow>(this.baseUrl, body));
  }

  // Dejar de seguir
  unfollow(followerId: string | number, followingId: string | number) {
    return firstValueFrom(
      this.http.get<Follow[]>(`${this.baseUrl}?followerId=${followerId}&followingId=${followingId}`)
    ).then(res => {
      if (res.length === 0) return;
      return firstValueFrom(this.http.delete(`${this.baseUrl}/${res[0].id}`));
    });
  }

  // Verificar si A sigue a B
isFollowing(followerId: string | number, followingId: string | number) {
  return this.http.get<Follow[]>(
    `${this.baseUrl}?followerId=${followerId}&followingId=${followingId}`
  ).pipe(
    map(result => result.length > 0)
  );
}

  // Listar usuarios que siguen al usuario X
  getFollowers(userId: string | number) {
    return firstValueFrom(
      this.http.get<Follow[]>(`${this.baseUrl}?followingId=${userId}`)
    );
  }

  // Listar usuarios seguidos por el usuario X
  getFollowing(userId: string | number) {
    return firstValueFrom(
      this.http.get<Follow[]>(`${this.baseUrl}?followerId=${userId}`)
    );
  }
  
}
