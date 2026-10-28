'use client'

import { ButtonCount } from '@/components/ui/ButtonCount'
import type { Product } from '@/lib/types'
import { useCartStore } from '@/store/cart-store'

// Port of src/components/Cart/cart-item.vue.

interface CartItemProps {
  cartItem: Product
  itemCount: number
}

export function CartItem({ cartItem, itemCount }: CartItemProps) {
  const addToCart = useCartStore((state) => state.addToCart)
  const removeFromCart = useCartStore((state) => state.removeFromCart)

  if (!(itemCount > 0)) return null

  return (
    <div className="flex w-full flex-row items-center justify-between gap-12 px-6 lg:px-10">
      <div className="flex h-full w-full flex-row gap-6">
        <img
          className="aspect-square w-20 rounded-lg object-cover shadow-md lg:w-24"
          src={cartItem.src}
          alt=""
        />
        <div className="flex flex-col justify-center">
          <p className="text-lg font-bold text-k-black lg:text-xl">
            {cartItem.header}
          </p>
          <p className="lg:text-md text-sm font-bold text-k-black opacity-80">
            {`$ ${cartItem.price}`}
          </p>
        </div>
      </div>
      <ButtonCount
        itemCount={itemCount}
        onIncreaseCart={() => addToCart(cartItem)}
        onDecreaseCart={() => removeFromCart(cartItem)}
      />
    </div>
  )
}
