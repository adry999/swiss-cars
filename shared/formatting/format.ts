/**
 * Format a number as price with comma separator
 * Example: 15000 -> "15,000"
 */
export function formatPrice(value: number): string {
    return Math.round(value).toLocaleString('en-US');
}
