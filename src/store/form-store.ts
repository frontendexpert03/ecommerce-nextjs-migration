import { create } from 'zustand'
import {
  isValidAddress,
  isValidCity,
  isValidCountry,
  isValidEmail,
  isValidName,
  isValidPhone,
  isValidZip,
} from '@/lib/validation'
import { selectCartLength, useCartStore } from '@/store/cart-store'

// Port of the Vue app's src/pinia/formStore.ts. Validators live in
// src/lib/validation.ts; Pinia getters become the select* functions below.

export type FormField =
  | 'name'
  | 'email'
  | 'phone'
  | 'address'
  | 'zip'
  | 'city'
  | 'country'
  | 'comment'

interface FormState extends Record<FormField, string> {
  bannerState: 'show' | 'hide'
  payment: string
  showErrors: boolean
  bannerOn: () => void
  bannerOff: () => void
  setCash: (event: Pick<Event, 'preventDefault'>) => void
  setElectronic: (event: Pick<Event, 'preventDefault'>) => void
  /** What the Vue inputs do with `v-model="formStore[id]"`. */
  setField: (field: FormField, value: string) => void
  submit: () => void
}

export const useFormStore = create<FormState>()((set, get) => ({
  bannerState: 'hide',
  name: '',
  email: '',
  phone: '',
  address: '',
  zip: '',
  city: '',
  country: '',
  payment: 'electronic',
  comment: '',
  showErrors: false,

  bannerOn: () => set({ bannerState: 'show' }),

  bannerOff: () => set({ bannerState: 'hide' }),

  setCash: (event) => {
    event.preventDefault()
    set({ payment: 'cash' })
  },

  // 'electonic' is a typo in the original. Only 'cash' is ever checked, so
  // it has no visible effect; it is kept so the state matches.
  setElectronic: (event) => {
    event.preventDefault()
    set({ payment: 'electonic' })
  },

  setField: (field, value) => set({ [field]: value }),

  // The original reads the cart store once, when formStore.ts is imported.
  // Reading it here, at call time, gives the same result.
  submit: () => {
    if (selectCartLength(useCartStore.getState()) === 0) {
      alert('Shopping cart is empty!')
      return
    }

    const state = get()
    const allSet =
      isValidName(state.name) === 'true' &&
      isValidEmail(state.email) === 'true' &&
      // Optional: only an invalid phone number blocks the order.
      isValidPhone(state.phone) !== 'false' &&
      isValidAddress(state.address) === 'true' &&
      isValidZip(state.zip) === 'true' &&
      isValidCity(state.city) === 'true' &&
      isValidCountry(state.country) === 'true'

    if (allSet) {
      // The original has no backend: a valid order just shows the banner.
      set({ showErrors: false, bannerState: 'show' })
      return
    }

    set({ showErrors: true })
  },
}))

export const selectShowBanner = (state: Pick<FormState, 'bannerState'>) =>
  state.bannerState === 'show'

export const selectChoseCash = (state: Pick<FormState, 'payment'>) =>
  state.payment === 'cash'
