'use client'

import { useEffect, useState } from 'react'
import { ButtonSolid } from '@/components/ui/ButtonSolid'
import { RouterLink } from '@/components/ui/RouterLink'
import { getSelection } from '@/lib/products'
import { productHref } from '@/lib/routes'
import type { Product } from '@/lib/types'

// Port of src/components/ymal-boxes.vue ("You may also like").

interface YouMayAlsoLikeProps {
  productCategory: string
  productId: number
}

export function YouMayAlsoLike({
  productCategory,
  productId,
}: YouMayAlsoLikeProps) {
  const [items, setItems] = useState<Product[]>([])

  // The original picks in onBeforeMount. Here the picks are random, so they
  // are made after mount: server and browser would pick differently and
  // the HTML would not match on hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only random picks, see above
    setItems(getSelection(productCategory, productId))
  }, [productCategory, productId])

  return (
    <section className="mt-20 flex w-4/5 max-w-6xl flex-col items-center lg:mt-32">
      <h2 className="mb-16 font-Manrope text-3xl font-bold uppercase text-black">
        You may also like
      </h2>
      <div className="flex flex-col items-center gap-12 lg:grid lg:grid-cols-3 lg:grid-rows-1 lg:gap-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-between gap-8 lg:gap-10"
          >
            <RouterLink
              href={productHref(item.category, item.id)}
              // Picture-only link: named for screen readers (docs/adr/0016).
              aria-label={`${item.header} ${item.subheader}`}
              className="overflow-hidden rounded"
            >
              <img
                className="object-center"
                src={item.src}
                alt=""
                loading="lazy"
              />
            </RouterLink>
            <h3 className="text-center font-Manrope text-2xl font-semibold text-black">
              {`${item.header} `}
              <br className="hidden lg:inline" />
              <span className="capitalize">{` ${item.subheader}`}</span>
            </h3>
            <ButtonSolid
              to={productHref(item.category, item.id)}
              color="light"
              content="see product"
              size="small"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
