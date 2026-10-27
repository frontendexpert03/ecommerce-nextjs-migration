'use client'

import { Footer } from '@/components/layout/Footer'
import { Navigation } from '@/components/layout/Navigation'
import { ButtonGoBack } from '@/components/ui/ButtonGoBack'
import { CheckoutGrid } from '@/features/checkout/components/CheckoutGrid'
import { CheckoutSuccessModal } from '@/features/checkout/components/CheckoutSuccessModal'
import { selectShowBanner, useFormStore } from '@/store/form-store'

// Port of src/pages/Checkout/checkout-page.vue.

export function CheckoutPage() {
	const showBanner = useFormStore(selectShowBanner)

	return (
		<main className="flex h-full w-screen flex-col items-center bg-k-grey">
			<Navigation color="black" />
			<ButtonGoBack />
			{showBanner && <CheckoutSuccessModal />}
			<CheckoutGrid />
			<Footer />
		</main>
	)
}
