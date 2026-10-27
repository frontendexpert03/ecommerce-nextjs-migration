// The checkout validators from the Vue app's src/pinia/formStore.ts getters,
// as pure functions (docs/adr/0004). The patterns are copied unchanged,
// including their quirks; see docs/behaviour-spec.md#validators.

/** The original's three states, kept as strings because components compare them. */
export type FieldStatus = 'empty' | 'true' | 'false'

const check = (value: string, pattern: RegExp): FieldStatus => {
	if (value === '') return 'empty'
	return pattern.test(value) ? 'true' : 'false'
}

export const isValidName = (name: string) => check(name, /^[a-z ,.'-]+$/i)

export const isValidEmail = (email: string) =>
	check(email, /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-]+)(\.[a-zA-Z]{2,5}){1,2}$/)

export const isValidPhone = (phone: string) => check(phone, /^[0-9()-]+$/)

// Not anchored, and `,-\\` is a character range (comma to backslash), so
// almost any input passes.
export const isValidAddress = (address: string) =>
	check(address, /[\w',-\\/.\s]/)

export const isValidZip = (zip: string) =>
	check(zip, /^[0-9]{5}(?:-[0-9]{4})?$/)

// Not anchored: passes if the value contains at least one letter.
export const isValidCity = (city: string) => check(city, /[a-zA-Z]+/)

export const isValidCountry = (country: string) => check(country, /[a-zA-Z]+/)
