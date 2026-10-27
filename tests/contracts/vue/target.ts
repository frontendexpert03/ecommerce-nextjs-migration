import { render } from '@testing-library/vue'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { vi } from 'vitest'
import { nextTick } from 'vue'
import ButtonCount from '@vue-app/components/Buttons/button-count.vue'
import CartItem from '@vue-app/components/Cart/cart-item.vue'
import {
	get404PageMeta,
	getCategoryPageMeta,
	getCheckoutPageMeta,
	getLandingPageMeta,
	getProductPageMeta,
} from '@vue-app/data/meta-utils.ts'
import {
	getProduct,
	getProductsOfType,
	getSelection,
} from '@vue-app/data/product-utils.ts'
import { products } from '@vue-app/data/products.ts'
// Renamed on import: it is a Pinia store, but the React hooks lint rule
// treats any use* call as a React hook.
import { useCartStore as cartStoreOf } from '@vue-app/pinia/cartStore.ts'
import { capitalize } from '@vue-app/utils/utilities.ts'
import { recordGolden } from '../harness/golden'
import type { ContractComponent, ContractTarget } from '../harness/types'

// Adapter for the original Vue components, loaded read-only from the Vue app
// through the @vue-app alias (see vitest.config.mts).

// The .vue files are untyped here (vue-app.d.ts), so props are checked on the
// Next side only. ContractTarget still types every call made by the specs.
const components = { ButtonCount, CartItem } satisfies Record<
	ContractComponent,
	unknown
>

let pinia: Pinia
let formStoreOf: (pinia: Pinia) => Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any -- untyped original

const store = () => cartStoreOf(pinia)
const formStore = () => formStoreOf(pinia)

// Pinia state is reactive; copy it so tests compare plain objects.
const plain = <T>(value: T): T =>
	value === undefined ? value : JSON.parse(JSON.stringify(value))

// Creating the store starts useStorage, which loads the saved cart and
// listens for other tabs, as the app does on its first page.
const createStore = () => {
	pinia = createPinia()
	setActivePinia(pinia)
	store()
}

export const target: ContractTarget = {
	name: 'vue',

	async reset() {
		localStorage.clear()
		document.body.className = ''
		createStore()

		// formStore.ts calls useCartStore() at the top of the module (line 3),
		// so it stays tied to the Pinia that was active when it was first
		// imported. Import it again for each test, after this test's Pinia.
		vi.resetModules()
		;({ useFormStore: formStoreOf } =
			await import('@vue-app/pinia/formStore.ts'))
	},

	render(name, props) {
		const component = components[name as ContractComponent]
		const { container } = render(component, {
			props,
			global: { plugins: [pinia] },
		})
		return { root: container }
	},

	settle: () => nextTick(),

	golden: recordGolden,

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

	cart: {
		addToCart: (item) => store().addToCart(item),
		removeFromCart: (item) => store().removeFromCart(item),
		clearCart: () => store().clearCart(),
		cartOn: () => store().cartOn(),
		cartOff: () => store().cartOff(),

		read() {
			const s = store()
			return {
				cart: plain(s.cart),
				showCart: s.showCart,
				showQuickAdd: s.showQuickAdd,
				cartValue: s.cartValue,
				cartLength: s.cartLength,
				isEmpty: s.isEmpty,
				firstItem: plain(s.getFirstItem),
				uniqueItems: s.getUniqueItems,
				grandTotal: s.getGrandTotal,
				vat: s.getVat,
			}
		},

		// A new Pinia instance creates a new store, which reads localStorage
		// again through useStorage.
		reload: async () => createStore(),
	},

	form: {
		// v-model in text-input-field.vue assigns formStore[id] directly.
		setField: (field, value) => {
			formStore()[field] = value
		},
		setCash: (event) => formStore().setCash(event),
		setElectronic: (event) => formStore().setElectronic(event),
		bannerOn: () => formStore().bannerOn(),
		bannerOff: () => formStore().bannerOff(),
		submit: () => formStore().submit(),

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
				showBanner: s.showBanner,
				choseCash: s.choseCash,
				isValidName: s.isValidName,
				isValidEmail: s.isValidEmail,
				isValidPhone: s.isValidPhone,
				isValidAddress: s.isValidAddress,
				isValidZip: s.isValidZip,
				isValidCity: s.isValidCity,
				isValidCountry: s.isValidCountry,
			}
		},
	},
}
