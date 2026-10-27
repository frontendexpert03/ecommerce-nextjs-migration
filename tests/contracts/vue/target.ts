import { render } from '@testing-library/vue'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { nextTick } from 'vue'
import ButtonCount from '@vue-app/components/Buttons/button-count.vue'
import CartItem from '@vue-app/components/Cart/cart-item.vue'
// Renamed on import: it is a Pinia store, but the React hooks lint rule
// treats any use* call as a React hook.
import { useCartStore as cartStoreOf } from '@vue-app/pinia/cartStore.ts'
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

const store = () => cartStoreOf(pinia)

// Pinia state is reactive; copy it so tests compare plain objects.
const plain = <T>(value: T): T =>
	value === undefined ? value : JSON.parse(JSON.stringify(value))

const createStore = () => {
	pinia = createPinia()
	setActivePinia(pinia)
}

export const target: ContractTarget = {
	name: 'vue',

	reset() {
		localStorage.clear()
		document.body.className = ''
		createStore()
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

	expectGolden: recordGolden,

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
}
