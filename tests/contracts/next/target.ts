import { render } from '@testing-library/react'
import { act, createElement, type ComponentType } from 'react'
import { CartItem } from '@/components/cart/CartItem'
import { ButtonCount } from '@/components/ui/ButtonCount'
import { products } from '@/lib/data/products'
import {
	get404PageMeta,
	getCategoryPageMeta,
	getCheckoutPageMeta,
	getLandingPageMeta,
	getProductPageMeta,
} from '@/lib/metadata'
import { getProduct, getProductsOfType, getSelection } from '@/lib/products'
import { capitalize } from '@/lib/utils'
import {
	isValidAddress,
	isValidCity,
	isValidCountry,
	isValidEmail,
	isValidName,
	isValidPhone,
	isValidZip,
} from '@/lib/validation'
import {
	selectCartLength,
	selectCartValue,
	selectFirstItem,
	selectGrandTotal,
	selectIsEmpty,
	selectUniqueItems,
	selectVat,
	startCartSync,
	useCartStore,
} from '@/store/cart-store'
import {
	selectChoseCash,
	selectShowBanner,
	useFormStore,
} from '@/store/form-store'
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
const initialFormState = useFormStore.getState()

const store = () => useCartStore.getState()
const formStore = () => useFormStore.getState()

let stopCartSync = () => {}

export const target: ContractTarget = {
	name: 'next',

	// startCartSync is what the root layout's <CartSync> runs on mount.
	reset() {
		stopCartSync()
		useCartStore.setState(initialState, true)
		useFormStore.setState(initialFormState, true)
		localStorage.clear()
		document.body.className = ''
		stopCartSync = startCartSync()
	},

	render(name, props) {
		const component = components[name] as ComponentType<typeof props>
		const { container } = render(createElement(component, props))
		return { root: container }
	},

	settle: async () => {},

	golden: compareGolden,

	lib: {
		products,
		getSelection,
		getProductsOfType,
		getProduct,
		capitalize,
		getLandingPageMeta,
		getCategoryPageMeta,
		getProductPageMeta,
		getCheckoutPageMeta,
		get404PageMeta,
	},

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

	form: {
		setField: (field, value) => act(() => formStore().setField(field, value)),
		setCash: (event) => act(() => formStore().setCash(event)),
		setElectronic: (event) => act(() => formStore().setElectronic(event)),
		bannerOn: () => act(() => formStore().bannerOn()),
		bannerOff: () => act(() => formStore().bannerOff()),
		submit: () => act(() => formStore().submit()),

		read() {
			const s = formStore()
			return {
				bannerState: s.bannerState,
				name: s.name,
				email: s.email,
				phone: s.phone,
				address: s.address,
				zip: s.zip,
				city: s.city,
				country: s.country,
				payment: s.payment,
				comment: s.comment,
				showErrors: s.showErrors,
				showBanner: selectShowBanner(s),
				choseCash: selectChoseCash(s),
				isValidName: isValidName(s.name),
				isValidEmail: isValidEmail(s.email),
				isValidPhone: isValidPhone(s.phone),
				isValidAddress: isValidAddress(s.address),
				isValidZip: isValidZip(s.zip),
				isValidCity: isValidCity(s.city),
				isValidCountry: isValidCountry(s.country),
			}
		},
	},
}
