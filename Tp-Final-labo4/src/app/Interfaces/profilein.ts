
export type Role = 'superadmin' | 'admin' | 'user';

export interface Profile {
  id?: number;
  username: string;
  password: string;
  date?: string;
  cel?: string;
  email?: string;
  role: Role;
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

