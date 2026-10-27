import type { Product } from '@/lib/types'
import type { Cart, CartEntry } from '@/store/cart-store'

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

/** One app under test: the Vue original or the Next.js port. */
export interface ContractTarget {
	name: 'vue' | 'next'
	/** Clear localStorage, the <body> classes and the store before each test. */
	reset(): void
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
	/** Compare the rendered markup with the golden copy recorded from the Vue app. */
	expectGolden(root: Element, name: string): Promise<void>
	cart: CartDriver
}
