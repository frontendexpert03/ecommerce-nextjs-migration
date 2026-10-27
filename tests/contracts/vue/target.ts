import { render } from '@testing-library/vue'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { vi } from 'vitest'
import {
	defineComponent,
	h,
	nextTick,
	Transition,
	vShow,
	withDirectives,
} from 'vue'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import ButtonAddToCart from '@vue-app/components/Buttons/button-add-to-cart.vue'
import ButtonCount from '@vue-app/components/Buttons/button-count.vue'
import ButtonEmpty from '@vue-app/components/Buttons/button-empty.vue'
import ButtonGoBack from '@vue-app/components/Buttons/button-go-back.vue'
import ButtonQuickAdd from '@vue-app/components/Buttons/button-quick-add.vue'
import ButtonSolid from '@vue-app/components/Buttons/button-solid.vue'
import CartItem from '@vue-app/components/Cart/cart-item.vue'
import CartModal from '@vue-app/components/Cart/cart-modal.vue'
import CategoryBox from '@vue-app/components/Category-Box/category-box.vue'
import CategoryBoxContainer from '@vue-app/components/Category-Box/category-box-container.vue'
import Footer from '@vue-app/components/footer-global.vue'
import InfoSection from '@vue-app/components/info-section.vue'
import Navigation from '@vue-app/components/navigation-global.vue'
import YouMayAlsoLike from '@vue-app/components/ymal-boxes.vue'
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

// Vue's <Transition> used the way the app uses it (cart-modal.vue,
// navigation-global.vue): one element, toggled by v-show or v-if.
const FadeFixture = defineComponent({
	props: { show: Boolean, mode: String },
	setup(props) {
		const box = () => h('div', { class: 'fade-box' }, 'content')
		return () =>
			h(Transition, null, () =>
				props.mode === 'if'
					? props.show
						? box()
						: null
					: withDirectives(box(), [[vShow, props.show]]),
			)
	},
})

// <Cart v-show="cartStore.showCart" /> from navigation-global.vue.
const CartModalFixture = defineComponent({
	props: { show: Boolean },
	setup(props) {
		return () => withDirectives(h(CartModal), [[vShow, props.show]])
	},
})

// The .vue files are untyped here (vue-app.d.ts), so props are checked on the
// Next side only. ContractTarget still types every call made by the specs.
const components = {
	ButtonCount,
	CartItem,
	ButtonSolid,
	ButtonEmpty,
	ButtonAddToCart,
	ButtonGoBack,
	ButtonQuickAdd,
	FadeFixture,
	CartModal: CartModalFixture,
	Navigation,
	Footer,
	InfoSection,
	CategoryBox,
	CategoryBoxContainer,
	YouMayAlsoLike,
} satisfies Record<ContractComponent, unknown>

// Vue spells the parent's class attribute `class`; the contracts use React's
// `className`.
const toVueProps = ({ className, ...props }: Record<string, unknown>) =>
	className === undefined ? props : { ...props, class: className }

let pinia: Pinia
let router: Router

// Every route renders nothing. The product routes have the names the app
// gives them in src/routes/route-utils.ts, because components link to
// { name: category, params: { id } }. Tests start on a path no button links
// to, so no <router-link> is "active" unless a test calls goTo().
const empty = { render: () => null }
const createTestRouter = async () => {
	router?.options.history.destroy()
	router = createRouter({
		history: createWebHistory(),
		routes: [
			...['keyboards', 'keycaps', 'deskmats'].map((name) => ({
				path: `/${name}/:id`,
				name,
				component: empty,
			})),
			{ path: '/:pathMatch(.*)*', component: empty },
		],
	})
	await router.push('/contract-test')
}
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
		await createTestRouter()

		// formStore.ts calls useCartStore() at the top of the module (line 3),
		// so it stays tied to the Pinia that was active when it was first
		// imported. Import it again for each test, after this test's Pinia.
		vi.resetModules()
		;({ useFormStore: formStoreOf } =
			await import('@vue-app/pinia/formStore.ts'))
	},

	render(name, props) {
		const component = components[name as ContractComponent]
		const { container, rerender } = render(component, {
			props: toVueProps(props),
			global: {
				plugins: [pinia, router],
				// Vue Test Utils stubs <Transition> by default; use the real one.
				stubs: { transition: false },
			},
		})
		return {
			root: container,
			rerender: (next) => rerender(toVueProps(next)),
		}
	},

	settle: () => nextTick(),

	goTo: async (path) => {
		await router.push(path)
	},

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
