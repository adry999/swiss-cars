import type { z } from 'zod';
import type { PartnerSchema } from './partners.schema';

export type Partner = z.infer<typeof PartnerSchema>;
