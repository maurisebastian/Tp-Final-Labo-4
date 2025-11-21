export interface ReviewLike {
  id?: number;
  idReview: number;   // Review a la que se le da like
  idProfile: number;  // Usuario que da el like
  date?: string;      // Opcional, fecha del like
}
