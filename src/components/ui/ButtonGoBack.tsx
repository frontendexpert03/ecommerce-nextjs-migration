'use client'

import type { KeyboardEvent } from 'react'

// Port of src/components/Buttons/button-go-back.vue. The original calls
// $router.go(-1), which is window.history.go(-1); calling it directly is the
// same step back without depending on a router.
//
// The original's <a> has no href, so keyboards cannot reach it and search
// engines see a broken link. role="button", tabIndex and Enter/Space make it
// a proper button without changing how it looks (docs/adr/0016).

const goBack = () => window.history.go(-1)

const onKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    goBack()
  }
}

export function ButtonGoBack() {
  return (
    <div className="mb-8 mt-10 w-4/5 max-w-6xl lg:mt-24">
      <a
        role="button"
        tabIndex={0}
        onClick={goBack}
        onKeyDown={onKeyDown}
        className="cursor-pointer text-start font-semibold text-black opacity-60 hover:opacity-100 active:translate-y-0.5"
      >
        Go Back
      </a>
    </div>
  )
}
