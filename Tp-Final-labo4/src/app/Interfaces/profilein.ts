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
  favoriteActors?: number[];
  isPublic?: boolean;
}

export interface Review {
  id?: string | number;
  idProfile: string | number;
  idMovie: number | string;          // 👈 CAMBIO IMPORTANTE
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
  id: string;
  type: 'review' | 'comment';

  // 👇 Todos estos pueden ser string o number en tu JSON
  idReview?: string | number;
  idComment?: string | number;
  idMovie?: string | number;
  reporterId: string | number;

  reason: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
  movieTitle?: string;
}
