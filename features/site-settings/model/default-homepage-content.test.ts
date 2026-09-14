import { describe, expect, it } from 'vitest';
import { HomepageContentSchema } from '../site-settings.schema';
import { DEFAULT_HOMEPAGE_CONTENT } from './default-homepage-content';

describe('DEFAULT_HOMEPAGE_CONTENT', () => {
    it('is a homepage the save action accepts', () => {
        expect(HomepageContentSchema.safeParse(DEFAULT_HOMEPAGE_CONTENT).success).toBe(true);
    });

    it('offers at least one hero slide so a fresh homepage is not empty', () => {
        expect(DEFAULT_HOMEPAGE_CONTENT.hero_slides.length).toBeGreaterThan(0);
    });
});
