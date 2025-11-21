export type Role = 'superadmin' | 'admin' | 'user';

export interface Profile {
  id?: any;               // string 
  username: string;
  password: string;
  date?: string;
  cel?: string;
  email?: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  favoriteGenres?: number[];
}



export interface Review {
  id?: number;
  idProfile: number;
  idMovie: number;
  score: number;
  description: string;
  userName?: string;
  movieName?: string;

   likesCount?: number;      // cantidad de likes
  likedByUser?: boolean;    // si el usuario actual dio like

 comments?: ReviewComment[];  
}

export interface ReviewComment {
  id?: number;
  idReview: number;    // Review relacionada
  idProfile: number;   // Usuario que comenta
  comment: string;     // Texto del comentario
  date?: string;       // Opcional
  userName?: string;   // Opcional, por conveniencia en el front

  likesCount?: number;
}




