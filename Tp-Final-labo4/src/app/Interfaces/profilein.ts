
export type Role = 'superadmin' | 'admin' | 'user';

export interface Profile {
  id?: number;
  username: string;
  password: string;
  date?: string;
  cel?: string;
  email?: string;
  role: Role;
  firstName: string;          // nombre
  lastName: string;           // apellido
  favoriteGenres?: number[];   // ids de géneros TMDB (acción, drama, etc.)
}

export interface Review {
  id?: number;
  idProfile: number;
  idMovie: number;
  score: number;
  description: string;
  userName?: string;
  movieName?: string;
}

