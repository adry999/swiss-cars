import 'server-only';

export { createSubmitLeadInquiry } from './server/submit-lead-inquiry';
export type { LeadInquiryRequester, SubmitLeadInquiry } from './server/submit-lead-inquiry';
export { supabaseLeadsRepository } from './server/supabase-leads-repository';
