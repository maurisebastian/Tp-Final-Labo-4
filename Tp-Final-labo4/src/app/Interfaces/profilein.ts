export type Role = 'superadmin' | 'admin' | 'user';

export interface Profile {
  id?: string | number;
  username: string;
  password: string;
  date?: string;
  cel?: string;
  email?: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  favoriteGenres?: number[];
  isPublic?: boolean;      
}

export interface Review {
  id?: string | number;
  idProfile: string | number;
  idMovie: number;
  score: number;
  description: string;
  userName?: string;
  movieName?: string;
  likesCount?: number;
  likedByUser?: boolean;
  comments?: ReviewComment[];
}

export interface ReviewComment {
  id?: string | number;
  idReview: string | number;
  idProfile: string | number;
  comment: string;
  date?: string;
  userName?: string;
  likesCount?: number;
}

export interface ReviewReport {
  id: string;                           // lo crea JSON Server
  type: 'review' | 'comment';           // qué se reporta
  idReview?: number;                    // reseña asociada
  idComment?: number;                   // comentario asociado (si aplica)
  idMovie?: number;                     // película asociada
  reporterId: number;                   // QUIÉN reportó
  reason: string;                       // motivo del reporte
  createdAt: string;                    // fecha
  status: 'pending' | 'resolved' | 'dismissed';
  movieTitle?: string;
}

