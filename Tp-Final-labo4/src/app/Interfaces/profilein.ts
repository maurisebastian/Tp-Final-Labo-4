
export interface Profile {
  id?: number;
  username: string;
  password: string;
  date?: string;
  cel?: string;
  email?: string;
}
export interface Review {
    idProfile: number;
  idMovie: number;
  score: number;
  description: string;
}

