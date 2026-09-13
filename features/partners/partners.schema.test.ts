import { describe, it, expect } from 'vitest';
import { PartnerSchema } from './partners.schema';

describe('PartnerSchema', () => {
    it('should validate a valid partner', () => {
        const validPartner = {
            name: 'Partner Company',
            logo_url: 'https://example.com/logo.png',
            website_url: 'https://example.com',
            sort_order: 1,
            is_visible: true,
        };

        const result = PartnerSchema.safeParse(validPartner);
        expect(result.success).toBe(true);
    });

    it('should allow null values for optional fields', () => {
        const partnerWithNulls = {
            name: null,
            logo_url: null,
            website_url: null,
            is_visible: true,
        };

        const result = PartnerSchema.safeParse(partnerWithNulls);
        expect(result.success).toBe(true);
    });

    it('should default is_visible to true', () => {
        const partner = {
            name: 'Test Partner',
            logo_url: null,
            website_url: null,
            sort_order: 1,
        };

        const result = PartnerSchema.safeParse(partner);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.is_visible).toBe(true);
        }
    });
});
