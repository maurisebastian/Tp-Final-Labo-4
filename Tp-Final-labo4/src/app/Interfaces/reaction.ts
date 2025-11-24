export interface ReviewLike {
  id?: number;
  idReview: number;   // Review a la que se le da like
  idProfile: number;  // Usuario que da el like
  date?: string;      // Opcional, fecha del like
}

export interface MovieActivityInterface {
  id?: number;
  idProfile: number | string;
  idMovie: string | number;
  movieName: string;
  status: 'watched' | 'towatch';
  watchedDate?: string | null; 
}

