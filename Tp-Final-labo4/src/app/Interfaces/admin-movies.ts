export interface AdminMovie {
  id?: number | string;
  tmdbId?: number;       // ID de TMDB (opcional)
  title: string;
  overview?: string;
  posterPath?: string;
  isHidden?: boolean;
}
