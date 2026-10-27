import { create } from 'zustand'
import { persist, type PersistStorage } from 'zustand/middleware'
import type { Product } from '@/lib/types'

// Port of the Vue app's src/pinia/cartStore.ts. Pinia getters become the
// select* functions below. See docs/adr/0004.

export const SHIPPING = 50
export const FREE_SHIPPING_THRESHOLD = 1000

export interface CartEntry {
	product: Product
	amount: number
}

export type Cart = Record<string, CartEntry>

interface CartState {
	cart: Cart
	showCart: boolean
	showQuickAdd: boolean
	cartOn: () => void
	cartOff: () => void
	addToCart: (item: Product) => void
	removeFromCart: (item: Product) => void
	clearCart: () => void
}

type PersistedCart = Pick<CartState, 'cart'>

const cartKey = (item: Product) => item.category + item.id

// VueUse's useStorage saves the bare cart object, not Zustand's
// { state, version } wrapper. Keeping the same format means a cart saved by
// either app loads in the other, and e2e specs can seed one shape for both.
const cartStorage: PersistStorage<PersistedCart> = {
	getItem: (name) => {
		const saved = localStorage.getItem(name)
		return saved === null
			? null
			: { state: { cart: JSON.parse(saved) as Cart } }
	},
	setItem: (name, value) => {
		localStorage.setItem(name, JSON.stringify(value.state.cart))
	},
	removeItem: (name) => {
		localStorage.removeItem(name)
	},
}

export const useCartStore = create<CartState>()(
	persist(
		(set) => ({
			cart: {},
			showCart: false,
			showQuickAdd: true,

			cartOn: () => {
				set({ showCart: true })
				document.body.classList.add('overflow-y-hidden')
			},

			cartOff: () => {
				set({ showCart: false })
				document.body.classList.remove('overflow-y-hidden')
			},

			addToCart: (item) =>
				set(({ cart }) => {
					const key = cartKey(item)
					const entry = cart[key]
					return {
						cart: {
							...cart,
							[key]: entry
								? { ...entry, amount: entry.amount + 1 }
								: { product: item, amount: 1 },
						},
					}
				}),

			removeFromCart: (item) =>
				set(({ cart }) => {
					const key = cartKey(item)
					const entry = cart[key]
					if (!entry) return {}
					if (entry.amount > 1) {
						return {
							cart: { ...cart, [key]: { ...entry, amount: entry.amount - 1 } },
						}
					}
					const rest = { ...cart }
					delete rest[key]
					return { cart: rest }
				}),

			clearCart: () => set({ cart: {} }),
		}),
		{
			name: 'cart',
			storage: cartStorage,
			partialize: (state) => ({ cart: state.cart }),
			// localStorage only exists in the browser. The saved cart is loaded
			// after mount with useCartStore.persist.rehydrate().
			skipHydration: true,
		},
	),
)

/**
 * Loads the saved cart, then reloads it whenever another tab saves one, as
 * VueUse's useStorage does in the original. Call once in the browser; the
 * returned function stops listening.
 */
export function startCartSync() {
	void useCartStore.persist.rehydrate()

	const onStorage = (event: StorageEvent) => {
		if (event.storageArea === localStorage && event.key === 'cart') {
			void useCartStore.persist.rehydrate()
		}
	}
	window.addEventListener('storage', onStorage)
	return () => window.removeEventListener('storage', onStorage)
}

export const selectCartValue = ({ cart }: PersistedCart) =>
	Object.values(cart).reduce(
		(total, { product, amount }) => total + amount * product.price,
		0,
	)

export const selectCartLength = ({ cart }: PersistedCart) =>
	Object.values(cart).reduce((total, { amount }) => total + amount, 0)

export const selectIsEmpty = ({ cart }: PersistedCart) =>
	Object.keys(cart).length < 1

export const selectFirstItem = ({
	cart,
}: PersistedCart): CartEntry | undefined => cart[Object.keys(cart)[0]]

export const selectUniqueItems = ({ cart }: PersistedCart) =>
	Object.keys(cart).length

// Shipping is free only above the threshold: exactly $1000 still pays $50.
export const selectGrandTotal = (state: PersistedCart) => {
	const value = selectCartValue(state)
	return value > FREE_SHIPPING_THRESHOLD ? value : value + SHIPPING
}

// 20% of the grand total, shipping included, as a 2-decimal string.
export const selectVat = (state: PersistedCart) =>
	(selectGrandTotal(state) * 0.2).toFixed(2)
