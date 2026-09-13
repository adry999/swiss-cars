import { z } from 'zod';

// subscribe_email() (database/2026-08-26_lead_subscriber_rpc.sql) re-validates the format for
// direct RPC callers; this schema only decides what the client sees before that round trip.
export const SubscriberEmailSchema = z.string().trim().pipe(z.email().max(255));
