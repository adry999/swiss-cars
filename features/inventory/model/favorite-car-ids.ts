export const FAVORITES_STORAGE_KEY = 'swisscars_favorites';
export const FAVORITES_CHANGED_EVENT = 'favorites-changed';

export function readFavoriteCarIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

export function writeFavoriteCarIds(ids: string[]): void {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
}
