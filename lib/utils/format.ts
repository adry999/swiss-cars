/**
 * Format a number as price with comma separator
 * Example: 15000 -> "15,000"
 */
export function formatPrice(value: number): string {
    return Math.round(value).toLocaleString('en-US');
}

/**
 * Format a number with space separator (European style)
 * Example: 15000 -> "15 000"
 */
export function formatNumber(value: number): string {
    return Math.round(value).toLocaleString('fr-FR');
}
