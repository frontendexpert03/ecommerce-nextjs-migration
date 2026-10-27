import { CheckoutForm } from '@/features/checkout/components/CheckoutForm'
import { CheckoutSummary } from '@/features/checkout/components/CheckoutSummary'

// Port of src/pages/Checkout/Components/checkout-grid.vue.

export function CheckoutGrid() {
	return (
		<div className="flex h-full w-11/12 max-w-6xl flex-col items-center gap-4 lg:mb-24 lg:grid lg:w-4/5 lg:grid-cols-3 lg:gap-6">
			<CheckoutForm />
			<CheckoutSummary />
		</div>
	)
}
