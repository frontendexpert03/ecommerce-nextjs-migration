import type { PageMeta } from '@/lib/metadata'
import type { Catalog, Product } from '@/lib/types'
import type { FieldStatus } from '@/lib/validation'
import type { Cart, CartEntry } from '@/store/cart-store'
import type { FormField } from '@/store/form-store'

/**
 * Props for every component under contract. Vue events are passed as
 * on<Event> props, which Vue treats as listeners and the React port takes as
 * callbacks, so the same props object renders either version.
 */
export interface ContractProps {
	ButtonCount: {
		itemCount: number
		onIncreaseCart?: () => void
		onDecreaseCart?: () => void
	}
	CartItem: { cartItem: Product; itemCount: number }
}

export type ContractComponent = keyof ContractProps

/** Cart state read the same way from the Pinia store and the Zustand store. */
export interface CartSnapshot {
	cart: Cart
	showCart: boolean
	showQuickAdd: boolean
	cartValue: number
	cartLength: number
	isEmpty: boolean
	firstItem: CartEntry | undefined
	uniqueItems: number
	grandTotal: number
	vat: string
}

export interface CartDriver {
	addToCart(item: Product): void
	removeFromCart(item: Product): void
	clearCart(): void
	cartOn(): void
	cartOff(): void
	read(): CartSnapshot
	/** Recreate the store from localStorage, as a page reload would. */
	reload(): Promise<void>
}

/** Checkout form state, with the Vue store's getters as plain values. */
export interface FormSnapshot extends Record<FormField, string> {
	bannerState: 'show' | 'hide'
	payment: string
	showErrors: boolean
	showBanner: boolean
	choseCash: boolean
	isValidName: FieldStatus
	isValidEmail: FieldStatus
	isValidPhone: FieldStatus
	isValidAddress: FieldStatus
	isValidZip: FieldStatus
	isValidCity: FieldStatus
	isValidCountry: FieldStatus
}

export interface FormDriver {
	/** Type into a field, as the Vue inputs' v-model does. */
	setField(field: FormField, value: string): void
	setCash(event: Pick<Event, 'preventDefault'>): void
	setElectronic(event: Pick<Event, 'preventDefault'>): void
	bannerOn(): void
	bannerOff(): void
	submit(): void
	read(): FormSnapshot
}

/** Catalog data and helpers, under the Vue app's function names. */
export interface Lib {
	products: Catalog
	getSelection(productCategory: string, productId: number): Product[]
	getProductsOfType(category: string): Product[]
	getProduct(category: string, id: number): Product | null
	capitalize(str: string): string
	getLandingPageMeta(): PageMeta
	getCategoryPageMeta(category: string): PageMeta | undefined
	getProductPageMeta(product: Product): PageMeta
	getCheckoutPageMeta(): PageMeta
	get404PageMeta(): PageMeta
}

/** One app under test: the Vue original or the Next.js port. */
export interface ContractTarget {
	name: 'vue' | 'next'
	/** Clear localStorage, the <body> classes and the stores before each test. */
	reset(): void | Promise<void>
	/**
	 * Render a component. `root` is the element whose children are exactly
	 * what the component rendered.
	 */
	render<K extends ContractComponent>(
		name: K,
		props: ContractProps[K],
	): { root: Element }
	/** Wait until state changes have reached the DOM and localStorage. */
	settle(): Promise<void>
	/**
	 * Check `content` against `__golden__/<file>`. The Vue target records the
	 * file; the Next target only compares. Specs use expectMarkup and
	 * expectData from ./assertions instead of calling this directly.
	 */
	golden(file: string, content: string): Promise<void>
	cart: CartDriver
	form: FormDriver
	lib: Lib
}
