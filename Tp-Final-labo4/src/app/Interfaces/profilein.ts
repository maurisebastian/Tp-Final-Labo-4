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
  id?: string | number;
  type: 'review' | 'comment';
  idReview?: string | number;
  idComment?: string | number;
  idMovie?: number;
  reporterId: string | number;
  reason: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}
