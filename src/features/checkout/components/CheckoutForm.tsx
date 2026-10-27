'use client'

import { TextInputField } from '@/features/checkout/components/TextInputField'
import { cx } from '@/lib/utils'
import {
	isValidAddress,
	isValidCity,
	isValidCountry,
	isValidEmail,
	isValidName,
	isValidPhone,
	isValidZip,
} from '@/lib/validation'
import { selectChoseCash, useFormStore } from '@/store/form-store'

// Port of src/pages/Checkout/Components/checkout-form.vue, quirks included:
// the "Payment Method" <p> has for="country", the comment label points at
// the country field, the textarea has type="", and "United Stated" is the
// original's placeholder. The payment buttons are submit buttons inside the
// form; setCash/setElectronic call preventDefault, so the form never submits.

export function CheckoutForm() {
	const name = useFormStore((state) => state.name)
	const email = useFormStore((state) => state.email)
	const phone = useFormStore((state) => state.phone)
	const address = useFormStore((state) => state.address)
	const zip = useFormStore((state) => state.zip)
	const city = useFormStore((state) => state.city)
	const country = useFormStore((state) => state.country)
	const comment = useFormStore((state) => state.comment)
	const choseCash = useFormStore(selectChoseCash)
	const setCash = useFormStore((state) => state.setCash)
	const setElectronic = useFormStore((state) => state.setElectronic)
	const setField = useFormStore((state) => state.setField)

	return (
		<form
			className="col-span-2 h-full w-full rounded bg-white px-6 py-12 lg:px-10"
			id="checkoutForm"
		>
			<h1 className="text-3xl font-bold uppercase text-black">Checkout</h1>
			<div className="mt-10">
				<p className="mb-2 font-bold uppercase tracking-wider text-k-main">
					Billing details
				</p>
				<div className="flex w-full flex-col items-center gap-4 lg:grid lg:grid-cols-2">
					<TextInputField
						type="text"
						validator={isValidName(name)}
						id="name"
						label="Name"
						placeholder="Alex Keebs"
						errorMessage="Characters only."
						autocomplete="off"
						required={true}
					/>

					<TextInputField
						type="email"
						validator={isValidEmail(email)}
						id="email"
						label="Email Address"
						placeholder="alex@mail.com"
						errorMessage="Must be a valid email address."
						autocomplete="off"
						required={true}
					/>

					<TextInputField
						type="tel"
						validator={isValidPhone(phone)}
						id="phone"
						label="Phone Number"
						placeholder="+1000-555-0136"
						errorMessage="Numbers and '+-' only."
						autocomplete="off"
					/>
				</div>
			</div>

			<div className="mt-10">
				<p className="mb-2 font-bold uppercase tracking-wider text-k-main">
					Shipping Info
				</p>
				<div className="flex w-full flex-col items-center gap-4 lg:grid lg:grid-cols-2">
					<TextInputField
						type="text"
						validator={isValidAddress(address)}
						id="address"
						label="Address"
						containerClass="col-span-2"
						placeholder="1134 Willams Avenue"
						errorMessage="Only characters and ',-/. allowed."
						autocomplete="off"
						required={true}
					/>

					<TextInputField
						type="text"
						validator={isValidZip(zip)}
						id="zip"
						label="Zip Code"
						placeholder="10001"
						errorMessage="Only 5 digit numbers allowed."
						autocomplete="off"
						maxLength={5}
						required={true}
					/>

					<TextInputField
						type="text"
						validator={isValidCity(city)}
						id="city"
						label="City"
						placeholder="New York"
						errorMessage="Must contain non-special characters."
						autocomplete="off"
						required={true}
					/>

					<TextInputField
						type="text"
						validator={isValidCountry(country)}
						id="country"
						label="Country"
						placeholder="United Stated"
						errorMessage="Must contain non-special characters."
						autocomplete="off"
						required={true}
					/>
				</div>
			</div>

			<div className="mt-10">
				<p className="mb-2 font-bold uppercase tracking-wider text-k-main">
					Payment Details
				</p>
				<p className="mb-1 font-bold text-black" {...{ htmlFor: 'country' }}>
					Payment Method
				</p>
				<div className="flex w-full flex-col gap-4 lg:grid lg:grid-cols-2">
					<button
						className={cx(
							'group flex w-full cursor-pointer flex-row items-center gap-4 rounded border border-black border-opacity-60 p-3 transition-all active:translate-y-0.5',
							!choseCash && 'bg-k-main',
						)}
						onClick={(event) => setElectronic(event)}
						data-test="form-button-emoney"
					>
						<div
							className={cx(
								'aspect-square h-3 rounded-full border border-black border-opacity-60',
								!choseCash && 'bg-black',
							)}
						></div>
						<span className="font-semibold text-black"> e-Money </span>
					</button>
					<button
						className={cx(
							'group flex w-full cursor-pointer flex-row items-center gap-4 rounded border border-black border-opacity-60 p-3 transition-all active:translate-y-0.5',
							choseCash && 'bg-k-main',
						)}
						onClick={(event) => setCash(event)}
						data-test="form-button-cash"
					>
						<div
							className={cx(
								'aspect-square h-3 rounded-full border border-black border-opacity-60',
								choseCash && 'bg-black',
							)}
						></div>
						<span className="font-semibold text-black"> Cash on Delivery </span>
					</button>

					<div className="col-span-2 flex h-40 flex-col">
						<label className="mb-1 mt-4 font-bold text-black" htmlFor="country">
							Add a comment
						</label>
						<textarea
							className="h-full rounded border border-black border-opacity-60 bg-white p-3 font-Manrope font-semibold text-black outline-none hover:border-k-main"
							{...{ type: '' }}
							id="comment"
							placeholder="Your request"
							value={comment}
							onChange={(event) => setField('comment', event.target.value)}
							required
							data-test="form-text-area"
						/>
					</div>
				</div>
			</div>
		</form>
	)
}
