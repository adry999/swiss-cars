export type TranslatedText = Partial<Record<string, string | undefined>> | string | null | undefined;

/** Romanian is the fallback because every admin-edited field requires it. */
export function pickTranslation(field: TranslatedText, locale: string): string | undefined {
    if (typeof field === 'string') return field || undefined;
    return field?.[locale] || field?.ro || undefined;
}
