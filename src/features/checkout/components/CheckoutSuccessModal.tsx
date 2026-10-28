'use client'

import { useLayoutEffect } from 'react'
import { ButtonSolid } from '@/components/ui/ButtonSolid'
import { RouterLink } from '@/components/ui/RouterLink'
import {
  selectFirstItem,
  selectGrandTotal,
  selectUniqueItems,
  useCartStore,
} from '@/store/cart-store'
import { selectShowBanner, useFormStore } from '@/store/form-store'

// Port of src/pages/Checkout/Components/checkout-success-modal.vue. The
// checkout page adds and removes it as a whole, so its <Transition> never
// runs in the original and it has no Fade here. It is only shown after a
// successful submit, which needs a non-empty cart.

export function CheckoutSuccessModal() {
  const firstItem = useCartStore(selectFirstItem)!
  const uniqueItems = useCartStore(selectUniqueItems)
  const grandTotal = useCartStore(selectGrandTotal)
  const clearCart = useCartStore((state) => state.clearCart)
  const bannerOff = useFormStore((state) => state.bannerOff)

  const handleClose = () => {
    clearCart()
    bannerOff()
  }

  // onBeforeMount / onBeforeUnmount in the original: lock page scroll
  // while the modal is open.
  useLayoutEffect(() => {
    if (selectShowBanner(useFormStore.getState())) {
      document.body.classList.add('overflow-y-hidden')
    }
    return () => document.body.classList.remove('overflow-y-hidden')
  }, [])

  return (
    <div
      className="fixed z-40 flex h-full w-full flex-col items-center backdrop-blur-sm"
      data-test="checkout-success-modal"
    >
      <RouterLink
        href="/"
        onClick={() => handleClose()}
        className="absolute h-screen w-full bg-black opacity-40"
      ></RouterLink>
      <div className="relative z-10 mx-4 mt-6 flex flex-col rounded-md bg-white p-10 md:mt-20 md:p-12">
        <div className="absolute right-10 flex h-10 w-10 flex-shrink-0 flex-row items-center justify-center rounded-full bg-k-main md:static lg:h-20 lg:w-20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="black"
            className="h-8 w-8 lg:h-14 lg:w-14"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold uppercase text-black md:mt-6 lg:mt-8 lg:text-3xl">
          thank you <br /> for your order
        </h2>
        <p className="text-md mt-4 font-semibold text-black opacity-60 lg:mt-6 lg:text-lg">
          You will receive an email confirmation shortly.
        </p>
        <div className="mb-4 mt-6 flex h-full w-full flex-col overflow-hidden rounded-lg lg:mb-6 lg:mt-8 lg:flex-row lg:items-center">
          <div className="flex h-full w-full flex-col justify-center bg-k-grey px-4 py-6 lg:basis-4/6">
            <div className="flex h-full w-full flex-row items-center">
              <img
                className="aspect-square h-24"
                src={firstItem.product.src}
                alt=""
                loading="lazy"
              />
              <div className="ml-3 flex flex-col items-start justify-center">
                <p className="text-lg font-bold text-black">
                  {firstItem.product.header}
                </p>
                <p className="text-lg font-bold text-black opacity-60">
                  {`$${firstItem.product.price}`}
                </p>
              </div>
              <p className="ml-auto place-self-center text-lg font-bold text-black opacity-60">
                {`x${firstItem.amount}`}
              </p>
            </div>
            {uniqueItems > 1 && <hr />}
            {uniqueItems > 1 && (
              <p className="mt-2 text-center font-semibold text-black opacity-70">
                {`and ${uniqueItems - 1} other item`}
                <span style={uniqueItems > 2 ? undefined : { display: 'none' }}>
                  s
                </span>
              </p>
            )}
          </div>
          <div className="flex flex-col justify-center bg-black px-6 py-6 lg:h-full lg:basis-2/6">
            <div>
              <p className="text-md font-semibold uppercase tracking-wide opacity-90">
                Grand Total
              </p>
              <p className="text-md font-semibold lg:text-lg">{`$ ${grandTotal}`}</p>
            </div>
          </div>
        </div>
        <ButtonSolid
          to="/"
          onClick={() => handleClose()}
          color="light"
          content="back to home"
          className="mt-6 self-center font-bold"
          data-test="checkout-success-modal-button"
        />
      </div>
    </div>
  )
}
