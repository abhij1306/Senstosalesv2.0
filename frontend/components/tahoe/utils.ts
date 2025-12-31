/**
 * Utility function for merging class names
 * Used throughout Tahoe components for conditional styling
 */
export const cn = (...classes: (string | boolean | undefined | null)[]) =>
    classes.filter(Boolean).join(' ');

/**
 * clamp utility for constraining numeric values
 */
export const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);
