// Catalog types, ported from the Vue app's src/data/product-types.ts.

export interface BoxContent {
	count: number
	content: string
}

export interface Product {
	id: number
	category: string
	src: string
	topSrc: string
	botSrc: string
	rightSrc: string
	nu: boolean
	header: string
	subheader: string
	text: string
	features: string
	inthebox: BoxContent[]
	price: number
}

export type Catalog = Record<string, Product[]>
