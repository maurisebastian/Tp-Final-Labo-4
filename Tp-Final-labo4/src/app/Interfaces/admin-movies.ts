export interface AdminMovie {
  id?: string | number;
  title: string;
  overview?: string;
  posterPath?: string;
  isHidden: boolean;
  tmdbId?: number;
  hiddenReason?: string;   // 🔹 nuevo
}

export interface PopularMovie {
  idMovie: number;
  title: string;
  reviewCount: number;
  posterPath: string | null;
}


