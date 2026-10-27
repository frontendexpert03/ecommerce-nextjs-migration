import type { Metadata } from 'next'
import { CheckoutPage } from '@/features/checkout/CheckoutPage'
import { getCheckoutPageMeta, toMetadata } from '@/lib/metadata'

export const metadata: Metadata = toMetadata(getCheckoutPageMeta())

export default function Page() {
	return <CheckoutPage />
}
