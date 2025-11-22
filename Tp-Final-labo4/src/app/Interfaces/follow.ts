export interface Follow {
  id?: number;                 
  followerId: number | string; // Usuario que sigue
  followingId: number | string;// Usuario que es seguido
  createdAt?: string;      // Fecha del follow
}
