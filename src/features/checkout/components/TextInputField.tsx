'use client'

import type { HTMLInputTypeAttribute } from 'react'
import type { FieldStatus } from '@/lib/validation'
import { cx } from '@/lib/utils'
import { useFormStore, type FormField } from '@/store/form-store'

// Port of src/pages/Checkout/Components/text-input-field.vue. The input is
// bound to the form store field named by `id`, like the original's
// v-model="formStore[props.id]".

interface TextInputFieldProps {
	type: HTMLInputTypeAttribute
	validator: FieldStatus
	id: FormField
	label: string
	containerClass?: string
	placeholder?: string
	maxLength?: number
	autocomplete?: 'off'
	required?: boolean
	errorMessage: string
}

export function TextInputField({
	type,
	validator,
	id,
	label,
	containerClass,
	placeholder,
	maxLength,
	autocomplete,
	required,
	errorMessage,
}: TextInputFieldProps) {
	const value = useFormStore((state) => state[id])
	const showErrors = useFormStore((state) => state.showErrors)
	const setField = useFormStore((state) => state.setField)

	return (
		<div
			className={cx('mb-2 flex w-full flex-col', containerClass)}
			data-test={`text-input-${id}`}
		>
			<label className="mb-1 font-bold text-black" htmlFor={id}>
				{`${label} `}
				{required && <span className="text-sm"> *</span>}
			</label>
			<div className="relative h-full w-full">
				<input
					value={value}
					onChange={(event) => setField(id, event.target.value)}
					autoComplete={autocomplete}
					className={cx(
						[
							validator === 'false' && 'border-red-500',
							validator === 'false' && 'focus:border-red-500',
						],
						'w-full rounded border border-black border-opacity-60 bg-white p-3 font-Manrope font-semibold text-black outline-none focus:border-k-main',
					)}
					type={type}
					id={id}
					maxLength={maxLength}
					placeholder={placeholder}
					required={required}
					data-test={`text-input-field-${id}`}
				/>
				<div className="absolute ml-1 flex w-full text-sm text-red-500">
					{/* Required Message */}
					<p
						style={
							required && showErrors && validator === 'empty'
								? undefined
								: { display: 'none' }
						}
					>
						Required.
					</p>

					{/* Error Message */}
					<p style={validator === 'false' ? undefined : { display: 'none' }}>
						{errorMessage}
					</p>
				</div>
			</div>
		</div>
	)
}
