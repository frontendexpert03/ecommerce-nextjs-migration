import { RouterLink } from '@/components/ui/RouterLink'
import { cx } from '@/lib/utils'

// Port of src/components/Buttons/button-add-to-cart.vue. Nothing in the
// original imports it, and its markup is identical to ButtonEmpty. It is
// ported because the brief covers every component.

interface ButtonAddToCartProps {
  content?: string
  /** Extra classes for the inner <button>. */
  add?: string
  to?: string
}

export function ButtonAddToCart({
  content = 'to product',
  add,
  to = '/',
}: ButtonAddToCartProps) {
  return (
    <RouterLink href={to}>
      <button
        className={cx(
          'w-52 border-2 border-k-black px-10 py-3 font-bold uppercase tracking-wide text-k-black transition duration-100 hover:translate-y-0.5 hover:shadow-md active:translate-y-1',
          add,
        )}
      >
        {content}
      </button>
    </RouterLink>
  )
}
