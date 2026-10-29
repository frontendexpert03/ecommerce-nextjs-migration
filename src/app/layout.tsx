import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { preload } from 'react-dom'
import { CartSync } from '@/components/cart/CartSync'
import './fonts.css'
import './globals.css'

// From the Vue app's index.html: shown until a page sets its own title.
export const metadata: Metadata = {
  title: 'KIIBS Mechanical Keyboards',
  icons: { icon: '/icons/KIIIBS.png' },
}

// Set by Vercel while it builds a deployment.
const isVercel = process.env.VERCEL === '1'

// <div id="app"> is the Vue app's mount point in index.html; the inner
// <div> is App.vue.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  // fonts.css self-hosts the exact Manrope files the original gets from
  // Google Fonts (docs/adr/0013). The latin file is needed on every page.
  preload('/fonts/manrope/latin.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  })

  return (
    <html lang="en">
      <body>
        <CartSync />
        <div id="app">
          <div className="select-none font-Manrope">{children}</div>
        </div>
        {/* Vercel Web Analytics and Speed Insights (docs/adr/0023). Their
            scripts are served only by Vercel, so they are left out of other
            builds, where requesting them would fail (local, CI). */}
        {isVercel && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  )
}
