import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'hiddenTmdbMoviesWithReasons';

export interface HiddenMovie {
  tmdbId: number;
  title?: string;
  reason: string;
  hiddenAt: string; // ISO date
}

@Injectable({
  providedIn: 'root',
})
export class HiddenMoviesService {

  private hiddenMoviesSignal = signal<HiddenMovie[]>(this.loadFromStorage());
  // lo usamos en los componentes
  hiddenMovies = this.hiddenMoviesSignal.asReadonly();

  private loadFromStorage(): HiddenMovie[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((x: any) => ({
        tmdbId: Number(x.tmdbId),
        title: x.title ?? undefined,
        reason: String(x.reason ?? ''),
        hiddenAt: x.hiddenAt ?? new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }

  private saveToStorage(list: HiddenMovie[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  isHidden(tmdbId: number | null | undefined): boolean {
    if (tmdbId == null) return false;
    return this.hiddenMoviesSignal().some(m => m.tmdbId === Number(tmdbId));
  }

  getEntry(tmdbId: number | null | undefined): HiddenMovie | null {
    if (tmdbId == null) return null;
    return this.hiddenMoviesSignal().find(m => m.tmdbId === Number(tmdbId)) ?? null;
  }

  hideMovie(tmdbId: number, reason: string, title?: string) {
    const current = this.hiddenMoviesSignal();
    const filtered = current.filter(m => m.tmdbId !== tmdbId);

    const entry: HiddenMovie = {
      tmdbId,
      title,
      reason,
      hiddenAt: new Date().toISOString(),
    };

    const next = [...filtered, entry];
    this.hiddenMoviesSignal.set(next);
    this.saveToStorage(next);
  }

  unhideMovie(tmdbId: number) {
    const current = this.hiddenMoviesSignal();
    const next = current.filter(m => m.tmdbId !== tmdbId);
    this.hiddenMoviesSignal.set(next);
    this.saveToStorage(next);
  }
}
