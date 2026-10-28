'use client'

import { ButtonGoBack } from '@/components/ui/ButtonGoBack'
import { ButtonSolid } from '@/components/ui/ButtonSolid'
import type { Product } from '@/lib/types'
import { useCartStore } from '@/store/cart-store'

// Port of src/pages/Product/Components/product-core.vue.

export function ProductCore({ item }: { item: Product }) {
  const addToCart = useCartStore((state) => state.addToCart)

  return (
    <>
      <ButtonGoBack />
      <section className="flex w-4/5 max-w-6xl flex-col lg:grid lg:grid-cols-2 lg:grid-rows-1">
        <div className="flex flex-col items-center pb-6 lg:col-span-1 lg:col-start-2 lg:row-span-full lg:ml-24 lg:items-start lg:justify-center">
          {item.nu && (
            <p className="lg:text-md text-sm uppercase tracking-broad text-black">
              new product
            </p>
          )}
          <h1 className="mt-4 text-center text-4xl font-semibold uppercase text-black lg:text-start lg:text-6xl">
            {`${item.header} `}
            <br className="hidden lg:inline" />
            {` ${item.subheader}`}
          </h1>
          <p className="mt-6 text-center text-black opacity-60 lg:pr-20 lg:text-start">
            {item.text}
          </p>
          <p className="my-8 text-xl font-bold text-black">{`$ ${item.price}`}</p>
          <ButtonSolid
            onClick={() => addToCart(item)}
            color="light"
            add="font-bold"
            content="add to cart"
          />
        </div>
        <div className="order-first overflow-hidden rounded pb-10 lg:order-none lg:col-span-1 lg:col-start-1 lg:row-span-full lg:pb-0">
          <img
            loading="lazy"
            className="relative aspect-square object-cover"
            src={item.src}
            alt=""
          />
        </div>
      </section>
    </>
  )
}
