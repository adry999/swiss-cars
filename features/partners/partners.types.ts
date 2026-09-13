import type { z } from 'zod';
import type { ActionResult } from '@shared/contracts/action-result';
import type { PartnerSchema } from './partners.schema';

export type Partner = z.infer<typeof PartnerSchema>;

export type PartnerSaveResult = ActionResult<'invalid-input' | 'unavailable'>;
export type PartnerRemovalResult = ActionResult<'invalid-input' | 'unavailable'>;
