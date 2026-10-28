'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ComponentProps, MouseEvent } from 'react'
import { cx } from '@/lib/utils'

// Port of vue-router's <router-link> as the original uses it. On the page it
// points to, a link gets the classes router-link-active and
// router-link-exact-active and aria-current="page". The original's routes
// are flat, so "active" and "exact active" both mean "same path". Like
// <router-link>, it always renders a class attribute, even an empty one.
//
// Like <router-link>, it does not prefetch. Next's default prefetch loads
// each linked page in the background, and the browser then downloads that
// page's images too: about 1.6MB of home-page images on every page
// (docs/adr/0016).

type RouterLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string
  /**
   * An href attribute that differs from where the link goes. In Vue a
   * parent's attributes win over the component's own, so
   * <router-link :to="x" href=""> renders href="" yet still navigates to x
   * on a plain click (landing-grid.vue).
   */
  hrefAttribute?: string
}

export function RouterLink({
  href,
  hrefAttribute,
  className,
  onClick,
  ...props
}: RouterLinkProps) {
  const router = useRouter()
  const active = usePathname() === href
  const linkProps = {
    'aria-current': active ? ('page' as const) : undefined,
    className: cx(
      active && 'router-link-active router-link-exact-active',
      className,
    ),
  }

  if (hrefAttribute === undefined) {
    return (
      <Link
        href={href}
        prefetch={false}
        onClick={onClick}
        {...linkProps}
        {...props}
      />
    )
  }

  // vue-router's guardEvent: leave modified, non-left and already handled
  // clicks to the browser, which then follows the href attribute.
  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    const modified =
      event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
    if (modified || event.button !== 0 || event.defaultPrevented) return
    event.preventDefault()
    router.push(href)
  }

  return <a href={hrefAttribute} onClick={navigate} {...linkProps} {...props} />
}
