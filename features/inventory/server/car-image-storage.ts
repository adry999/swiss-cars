import 'server-only';
import { createServerSupabaseClient } from '@core/supabase/server-client';

const STORAGE_BUCKET = 'car-images';

export function storagePathFromUrl(url: string): string | null {
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    const index = url.indexOf(marker);
    if (index === -1) return null;
    const path = url.slice(index + marker.length).split('?')[0];
    return path ? decodeURIComponent(path) : null;
}

export async function deleteStorageObjects(
    supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
    urls: string[]
): Promise<void> {
    const candidates = [...new Set(urls)].filter(url => storagePathFromUrl(url) !== null);
    if (candidates.length === 0) return;

    const { data: stillReferenced, error: refError } = await supabase
        .from('car_images')
        .select('url')
        .in('url', candidates);

    if (refError) {
        console.error('Skipping storage cleanup, reference check failed:', refError);
        return;
    }

    const referenced = new Set((stillReferenced ?? []).map(row => row.url));
    const paths = candidates
        .filter(url => !referenced.has(url))
        .map(storagePathFromUrl)
        .filter((path): path is string => path !== null);

    if (paths.length === 0) return;

    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths);
    if (error) console.error('Failed to remove storage objects:', error, paths);
}
