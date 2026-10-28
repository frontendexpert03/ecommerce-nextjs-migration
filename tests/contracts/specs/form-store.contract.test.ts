import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { target } from '@contract-target'
import { keyboard } from '../fixtures'

// Spec: docs/behaviour-spec.md#form-store

const { form, cart } = target

const fillRequiredFields = () => {
  form.setField('name', 'Alex Keebs')
  form.setField('email', 'alex@mail.com')
  form.setField('address', 'Main St. 5')
  form.setField('zip', '10115')
  form.setField('city', 'Berlin')
  form.setField('country', 'Germany')
}

const clickEvent = () => ({ preventDefault: vi.fn() })

describe('form store', () => {
  beforeEach(() => target.reset())
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('FORM-01 starts empty, with no errors, no banner and electronic payment', () => {
    expect(form.read()).toEqual({
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
      showBanner: false,
      choseCash: false,
      isValidName: 'empty',
      isValidEmail: 'empty',
      isValidPhone: 'empty',
      isValidAddress: 'empty',
      isValidZip: 'empty',
      isValidCity: 'empty',
      isValidCountry: 'empty',
    })
  })

  test('FORM-02 typing into a field stores the value', () => {
    form.setField('name', 'Alex Keebs')
    form.setField('comment', 'Leave it at the door.')

    expect(form.read()).toMatchObject({
      name: 'Alex Keebs',
      comment: 'Leave it at the door.',
      isValidName: 'true',
    })
  })

  test('FORM-03 the cash button cancels the click and selects cash', () => {
    const event = clickEvent()

    form.setCash(event)

    expect(event.preventDefault).toHaveBeenCalledOnce()
    expect(form.read()).toMatchObject({ payment: 'cash', choseCash: true })
  })

  test('FORM-04 the e-money button cancels the click and stores "electonic"', () => {
    const event = clickEvent()
    form.setCash(clickEvent())

    form.setElectronic(event)

    expect(event.preventDefault).toHaveBeenCalledOnce()
    expect(form.read()).toMatchObject({
      payment: 'electonic',
      choseCash: false,
    })
  })

  test('FORM-05 bannerOn and bannerOff show and hide the success banner', () => {
    form.bannerOn()
    expect(form.read()).toMatchObject({ bannerState: 'show', showBanner: true })

    form.bannerOff()
    expect(form.read()).toMatchObject({
      bannerState: 'hide',
      showBanner: false,
    })
  })

  test('FORM-06 submitting with an empty cart alerts and changes nothing', () => {
    const alert = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})

    form.submit()

    expect(alert).toHaveBeenCalledExactlyOnceWith('Shopping cart is empty!')
    expect(form.read()).toMatchObject({ showErrors: false, showBanner: false })
  })

  test('FORM-07 submitting with a required field missing shows the errors', () => {
    cart.addToCart(keyboard)
    fillRequiredFields()
    form.setField('city', '')

    form.submit()

    expect(form.read()).toMatchObject({ showErrors: true, showBanner: false })
  })

  test('FORM-08 submitting a valid form without a phone number shows the banner', () => {
    cart.addToCart(keyboard)
    fillRequiredFields()

    form.submit()

    expect(form.read()).toMatchObject({ showErrors: false, showBanner: true })
  })

  test('FORM-09 an invalid phone number blocks the order, though the field is optional', () => {
    cart.addToCart(keyboard)
    fillRequiredFields()
    form.setField('phone', '+49 30 123')

    form.submit()

    expect(form.read()).toMatchObject({ showErrors: true, showBanner: false })
  })

  test('FORM-10 a valid submit after a failed one clears the errors', () => {
    cart.addToCart(keyboard)
    form.submit()
    expect(form.read().showErrors).toBe(true)

    fillRequiredFields()
    form.submit()

    expect(form.read()).toMatchObject({ showErrors: false, showBanner: true })
  })
})
