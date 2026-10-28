import { render } from '@testing-library/react'
import { act, createElement, type ComponentType } from 'react'
import { CartItem } from '@/components/cart/CartItem'
import { CartModal } from '@/components/cart/CartModal'
import { Footer } from '@/components/layout/Footer'
import { Navigation } from '@/components/layout/Navigation'
import { CategoryBox } from '@/components/sections/CategoryBox'
import { CategoryBoxContainer } from '@/components/sections/CategoryBoxContainer'
import { InfoSection } from '@/components/sections/InfoSection'
import { YouMayAlsoLike } from '@/components/sections/YouMayAlsoLike'
import { CategoryPage } from '@/features/category/CategoryPage'
import { CategoryShowBox } from '@/features/category/components/CategoryShowBox'
import { CheckoutPage } from '@/features/checkout/CheckoutPage'
import { CheckoutForm } from '@/features/checkout/components/CheckoutForm'
import { CheckoutGrid } from '@/features/checkout/components/CheckoutGrid'
import { CheckoutSuccessModal } from '@/features/checkout/components/CheckoutSuccessModal'
import { CheckoutSummary } from '@/features/checkout/components/CheckoutSummary'
import { CheckoutSummaryItem } from '@/features/checkout/components/CheckoutSummaryItem'
import { TextInputField } from '@/features/checkout/components/TextInputField'
import { LandingPage } from '@/features/landing/LandingPage'
import { LandingGrid } from '@/features/landing/components/LandingGrid'
import { LandingHero } from '@/features/landing/components/LandingHero'
import { NotFoundPage } from '@/features/not-found/NotFoundPage'
import { ProductPage } from '@/features/product/ProductPage'
import { ProductCore } from '@/features/product/components/ProductCore'
import { ProductFeatures } from '@/features/product/components/ProductFeatures'
import { ProductImageGrid } from '@/features/product/components/ProductImageGrid'
import { ButtonAddToCart } from '@/components/ui/ButtonAddToCart'
import { ButtonCount } from '@/components/ui/ButtonCount'
import { ButtonEmpty } from '@/components/ui/ButtonEmpty'
import { ButtonGoBack } from '@/components/ui/ButtonGoBack'
import { ButtonQuickAdd } from '@/components/ui/ButtonQuickAdd'
import { ButtonSolid } from '@/components/ui/ButtonSolid'
import { Fade } from '@/components/ui/Fade'
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
import { getPathname, setPathname } from '@/test/navigation'
import { compareGolden } from '../harness/golden'
import type { ContractProps, ContractTarget } from '../harness/types'

// Adapter for the Next.js port.

function FadeFixture({ show, mode }: ContractProps['FadeFixture']) {
  return (
    <Fade show={show} mode={mode}>
      <div className="fade-box">content</div>
    </Fade>
  )
}

// Fails to compile if a React component's props drift from the contract.
const components: {
  [K in keyof ContractProps]: ComponentType<ContractProps[K]>
} = {
  ButtonCount,
  CartItem,
  ButtonSolid,
  ButtonEmpty,
  ButtonAddToCart,
  ButtonGoBack,
  ButtonQuickAdd,
  FadeFixture,
  CartModal,
  Navigation,
  Footer,
  InfoSection,
  CategoryBox,
  CategoryBoxContainer,
  YouMayAlsoLike,
  LandingHero,
  LandingGrid,
  LandingPage,
  CategoryShowBox,
  CategoryPage,
  ProductCore,
  ProductFeatures,
  ProductImageGrid,
  ProductPage,
  TextInputField,
  CheckoutForm,
  CheckoutSummaryItem,
  CheckoutSummary,
  CheckoutSuccessModal,
  CheckoutGrid,
  CheckoutPage,
  NotFoundPage,
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
    setPathname('/contract-test')
  },

  render(name, props) {
    const component = components[name] as ComponentType<typeof props>
    const { container, rerender, unmount } = render(
      createElement(component, props),
    )
    return {
      root: container,
      rerender: async (next) => rerender(createElement(component, next)),
      unmount,
    }
  },

  settle: async () => {},

  goTo: async (path) => {
    setPathname(path)
  },

  currentPath: () => getPathname(),

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
