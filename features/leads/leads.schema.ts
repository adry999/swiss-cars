import { z } from 'zod';
import { LEAD_FORM_TYPES } from '@shared/contracts/domain-events';

const optionalText = (maxLength: number) =>
    z.string().trim().max(maxLength).optional().transform((text) => text || undefined);

// Limits mirror submit_lead() in database/2026-08-26_lead_subscriber_rpc.sql: anything looser here
// would pass validation and then fail inside the RPC as a server error.
export const LeadInquiryDraftSchema = z
    .object({
        formType: z.enum(LEAD_FORM_TYPES),
        carId: optionalText(100),
        carTitle: optionalText(200),
        customerName: z.string().trim().min(2).max(100),
        customerPhone: z.string().trim().min(7).max(35),
        customerEmail: z
            .union([z.literal(''), z.email().max(255)])
            .optional()
            .transform((email) => email || undefined),
        message: optionalText(2000),
        preferredDate: optionalText(100),
        sourceUrl: z.url({ protocol: /^https?$/ }).max(2000).optional(),
    })
    .refine((draft) => draft.formType !== 'inquiry' || Boolean(draft.carId && draft.carTitle), {
        path: ['carId'],
        message: 'A car inquiry must reference a car.',
    });
