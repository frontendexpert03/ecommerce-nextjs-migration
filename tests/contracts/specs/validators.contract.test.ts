import { beforeEach, describe, expect, test } from 'vitest'
import type { FieldStatus } from '@/lib/validation'
import type { FormField } from '@/store/form-store'
import { target } from '@contract-target'
import type { FormSnapshot } from '../harness/types'

// Spec: docs/behaviour-spec.md#validators
//
// Each validator is checked through the form store, as the checkout form
// uses it: set the field, then read the status.

type Case = [value: string, expected: FieldStatus]

const validators: [
	id: string,
	field: FormField,
	getter: keyof FormSnapshot,
	cases: Case[],
][] = [
	[
		'VAL-01',
		'name',
		'isValidName',
		[
			['Alex Keebs', 'true'],
			["O'Brien-Smith, Jr.", 'true'],
			[' ', 'true'],
			['José', 'false'],
			['R2D2', 'false'],
		],
	],
	[
		'VAL-02',
		'email',
		'isValidEmail',
		[
			['alex@mail.com', 'true'],
			['a.b-c_d@mail.co.uk', 'true'],
			['alex@sub.mail.com', 'true'],
			['alex+shop@mail.com', 'false'],
			['alex@mail', 'false'],
			['alex@mail.c', 'false'],
			['alex@mail.london', 'false'],
		],
	],
	[
		'VAL-03',
		'phone',
		'isValidPhone',
		[
			['030-1234567', 'true'],
			['(030)123', 'true'],
			['030 123', 'false'],
			['+4930123', 'false'],
		],
	],
	[
		'VAL-04',
		'address',
		'isValidAddress',
		[
			['Main St. 5', 'true'],
			['@', 'true'],
			['!!!', 'false'],
		],
	],
	[
		'VAL-05',
		'zip',
		'isValidZip',
		[
			['10115', 'true'],
			['12345-6789', 'true'],
			['1234', 'false'],
			['123456', 'false'],
			['AB 12', 'false'],
		],
	],
	[
		'VAL-06',
		'city',
		'isValidCity',
		[
			['Berlin', 'true'],
			['São Paulo', 'true'],
			['1a', 'true'],
			['123', 'false'],
		],
	],
	[
		'VAL-07',
		'country',
		'isValidCountry',
		[
			['Germany', 'true'],
			['1a', 'true'],
			['123', 'false'],
		],
	],
]

describe('validators', () => {
	beforeEach(() => target.reset())

	describe.each(validators)('%s %s', (_id, field, getter, cases) => {
		test('an empty field is "empty"', () => {
			expect(target.form.read()[getter]).toBe('empty')
		})

		test.each(cases)('%j is "%s"', (value, expected) => {
			target.form.setField(field, value)

			expect(target.form.read()[getter]).toBe(expected)
		})
	})
})
