import type { Product } from '@/lib/types'

// Two products copied from the Vue app's catalog (src/data/products.ts).
// Tests that need other prices derive them with withPrice().

export const keyboard: Product = {
	id: 0,
	category: 'keyboards',
	src: '/products/keyboards/pulsar-show.webp',
	topSrc: '/products/keyboards/pulsar-left.webp',
	botSrc: '/products/keyboards/pulsar-right.webp',
	rightSrc: '/products/keyboards/pulsar-detail.webp',
	nu: true,
	header: 'XX59',
	subheader: 'Keyboard',
	text: 'The new XX59 keyboard is the pinnacle of pristine typing. It redefines your premium keyboard experience by providing a balanced depth and precision to each press of a key.',
	features:
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae semper quis lectus nulla. Mi bibendum neque egestas congue quisque egestas diam in arcu. Metus aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices. Rutrum quisque non tellus orci ac auctor augue mauris augue.',
	inthebox: [
		{ count: 1, content: 'Keyboard' },
		{ count: 1, content: 'KIIBS Carrying Case' },
		{ count: 1, content: 'Model X Keycaps' },
		{ count: 1, content: 'USB Type-C Cable' },
	],
	price: 599,
}

export const deskmat: Product = {
	id: 1,
	category: 'deskmats',
	src: '/products/deskmats/mat2-show.webp',
	topSrc: '/products/deskmats/deskmat-chicken.webp',
	botSrc: '/products/deskmats/deskmat-ox.webp',
	rightSrc: '/products/deskmats/deskmat-kraken.webp',
	nu: false,
	header: 'Mythic',
	subheader: 'Deskmat',
	text: 'The new XX99 Mark II keyboard is the pinnacle of pristine typing. It redefines your premium keyboard experience by providing a balanced depth and precision to each press of a key.',
	features:
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae semper quis lectus nulla. Mi bibendum neque egestas congue quisque egestas diam in arcu. Metus aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices. Rutrum quisque non tellus orci ac auctor augue mauris augue.',
	inthebox: [
		{ count: 1, content: 'Deskmat' },
		{ count: 1, content: 'Carrying Pouch' },
	],
	price: 599,
}

export const withPrice = (product: Product, price: number): Product => ({
	...product,
	price,
})
