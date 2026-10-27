// Port of the Vue app's src/utils/utilities.ts. randomRange is not ported:
// nothing uses it.

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1)
}
