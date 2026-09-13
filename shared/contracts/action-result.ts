/**
 * Return shape of every Server Action with expected failures.
 * Expected failures are values, not exceptions; anything thrown reaches the nearest error boundary.
 */
export type ActionResult<RejectionReason extends string> =
    | { status: 'succeeded' }
    | { status: 'rejected'; reason: RejectionReason; invalidFields?: readonly string[] };
