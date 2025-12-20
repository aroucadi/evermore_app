/**
 * Normalizes speech text by removing fillers and hesitations.
 */
export function normalizeSpeech(text: string): string {
    return text
        .replace(/\b(um|uh|er|ah|like|you know|so yeah)\b/gi, '')
        // Clean up punctuation left behind (e.g. ", ,")
        .replace(/\s+,/g, ',')
        .replace(/,(\s*,)+/g, ',')
        .replace(/^,\s*/, '')
        .replace(/\s+/g, ' ')
        .trim();
}
