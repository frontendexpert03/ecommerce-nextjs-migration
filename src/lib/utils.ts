// Port of the Vue app's src/utils/utilities.ts. randomRange is not ported:
// nothing uses it.

type ClassValue = string | false | null | undefined | ClassValue[]

/**
 * Joins class names, skipping empty ones and flattening arrays, like Vue's
 * `:class="[...]"`. Order is kept, so the class attribute matches the
 * original. Arrays of single classes also stop Prettier's Tailwind plugin
 * from re-sorting them.
 */
export function cx(...classes: ClassValue[]): string {
  return classes
    .map((value) => (Array.isArray(value) ? cx(...value) : value))
    .filter(Boolean)
    .join(' ')
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
