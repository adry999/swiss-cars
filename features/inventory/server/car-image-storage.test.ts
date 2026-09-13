// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { storagePathFromUrl } from './car-image-storage';

describe('storagePathFromUrl', () => {
    it('extracts the object path from a public storage URL', () => {
        const url = 'https://project.supabase.co/storage/v1/object/public/car-images/cars/audi-a6/photo-1.jpg';
        expect(storagePathFromUrl(url)).toBe('cars/audi-a6/photo-1.jpg');
    });

    it('strips a trailing query string', () => {
        const url = 'https://project.supabase.co/storage/v1/object/public/car-images/cars/audi-a6/photo-1.jpg?token=abc123';
        expect(storagePathFromUrl(url)).toBe('cars/audi-a6/photo-1.jpg');
    });

    it('decodes a URL-encoded path', () => {
        const url = 'https://project.supabase.co/storage/v1/object/public/car-images/cars/audi%20a6/photo%201.jpg';
        expect(storagePathFromUrl(url)).toBe('cars/audi a6/photo 1.jpg');
    });

    it('returns null for a URL outside the car-images bucket', () => {
        const url = 'https://example.com/some/other/image.jpg';
        expect(storagePathFromUrl(url)).toBeNull();
    });
});
