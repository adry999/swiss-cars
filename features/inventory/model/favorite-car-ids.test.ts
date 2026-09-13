import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    FAVORITES_CHANGED_EVENT,
    FAVORITES_STORAGE_KEY,
    readFavoriteCarIds,
    writeFavoriteCarIds,
} from './favorite-car-ids';

describe('favorite-car-ids', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('round-trips ids written through localStorage', () => {
        writeFavoriteCarIds(['car-1', 'car-2']);
        expect(readFavoriteCarIds()).toEqual(['car-1', 'car-2']);
    });

    it('returns an empty list when storage holds corrupt JSON', () => {
        localStorage.setItem(FAVORITES_STORAGE_KEY, '{not json');
        expect(readFavoriteCarIds()).toEqual([]);
    });

    it('dispatches the favorites-changed event on write', () => {
        const listener = vi.fn();
        window.addEventListener(FAVORITES_CHANGED_EVENT, listener);

        writeFavoriteCarIds(['car-1']);

        expect(listener).toHaveBeenCalledTimes(1);
        window.removeEventListener(FAVORITES_CHANGED_EVENT, listener);
    });
});
