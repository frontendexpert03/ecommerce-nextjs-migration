import { render } from '@testing-library/react'
import { act, createElement, type ComponentType } from 'react'
import { CartItem } from '@/components/cart/CartItem'
import { ButtonCount } from '@/components/ui/ButtonCount'
import {
	selectCartLength,
	selectCartValue,
	selectFirstItem,
	selectGrandTotal,
	selectIsEmpty,
	selectUniqueItems,
	selectVat,
	useCartStore,
} from '@/store/cart-store'
import { compareGolden } from '../harness/golden'
import type { ContractProps, ContractTarget } from '../harness/types'

// Adapter for the Next.js port.

// Fails to compile if a React component's props drift from the contract.
const components: {
	[K in keyof ContractProps]: ComponentType<ContractProps[K]>
} = {
	ButtonCount,
	CartItem,
}

const initialState = useCartStore.getState()

const store = () => useCartStore.getState()

export const target: ContractTarget = {
	name: 'next',

	reset() {
		useCartStore.setState(initialState, true)
		localStorage.clear()
		document.body.className = ''
	},

	render(name, props) {
		const component = components[name] as ComponentType<typeof props>
		const { container } = render(createElement(component, props))
		return { root: container }
	},

	settle: async () => {},

	expectGolden: compareGolden,

	// Store updates made outside React are wrapped in act() so rendered
	// components update before the next assertion.
	cart: {
		addToCart: (item) => act(() => store().addToCart(item)),
		removeFromCart: (item) => act(() => store().removeFromCart(item)),
		clearCart: () => act(() => store().clearCart()),
		cartOn: () => act(() => store().cartOn()),
		cartOff: () => act(() => store().cartOff()),

		read() {
			const s = store()
			return {
				cart: s.cart,
				showCart: s.showCart,
				showQuickAdd: s.showQuickAdd,
				cartValue: selectCartValue(s),
				cartLength: selectCartLength(s),
				isEmpty: selectIsEmpty(s),
				firstItem: selectFirstItem(s),
				uniqueItems: selectUniqueItems(s),
				grandTotal: selectGrandTotal(s),
				vat: selectVat(s),
			}
		},

		// Only rehydrate: persist also saves on setState, so resetting the
		// store first would overwrite the saved cart with an empty one.
		reload: async () => {
			await useCartStore.persist.rehydrate()
		},
	},
}
