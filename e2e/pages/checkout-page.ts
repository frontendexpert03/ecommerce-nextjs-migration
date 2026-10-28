import type { Locator } from '@playwright/test'
import { StorePage } from './store-page'

export type Field =
  'name' | 'email' | 'phone' | 'address' | 'zip' | 'city' | 'country'

export const FIELDS: Field[] = [
  'name',
  'email',
  'phone',
  'address',
  'zip',
  'city',
  'country',
]

export const REQUIRED_FIELDS: Field[] = FIELDS.filter(
  (field) => field !== 'phone',
)

// Field labels; "Address" must not match "Email Address".
const LABELS: Record<Field, RegExp> = {
  name: /^Name/,
  email: /^Email Address/,
  phone: /^Phone Number/,
  address: /^Address/,
  zip: /^Zip Code/,
  city: /^City/,
  country: /^Country/,
}

export const VALID_ORDER: Partial<Record<Field, string>> = {
  name: 'Steven Bruben',
  email: 'steve@bruben.com',
  address: 'Alexanderplatz 12',
  zip: '10178',
  city: 'Berlin',
  country: 'Germany',
}

export class CheckoutPage extends StorePage {
  readonly payButton = this.page.getByRole('button', { name: 'continue & pay' })
  readonly cashButton = this.page.getByRole('button', {
    name: 'Cash on Delivery',
  })
  readonly emoneyButton = this.page.getByRole('button', { name: 'e-Money' })
  // Its label points at the Country field (CF-04), so find it by placeholder.
  readonly comment = this.page.getByPlaceholder('Your request')
  readonly summary = this.byTest('checkout-summary')
  readonly successModal = this.byTest('checkout-success-modal')
  readonly backToHomeButton = this.successModal.getByRole('button', {
    name: 'back to home',
  })

  input(field: Field): Locator {
    return this.page.getByLabel(LABELS[field])
  }

  /** The field with its label and messages. */
  fieldBox(field: Field): Locator {
    return this.byTest(`text-input-${field}`)
  }

  requiredMessage(field: Field): Locator {
    return this.fieldBox(field).getByText('Required.')
  }

  errorMessage(field: Field, message: string): Locator {
    return this.fieldBox(field).getByText(message)
  }

  async fill(values: Partial<Record<Field, string>>) {
    for (const [field, value] of Object.entries(values)) {
      await this.input(field as Field).fill(value)
    }
  }

  async pay() {
    await this.payButton.click()
  }
}
