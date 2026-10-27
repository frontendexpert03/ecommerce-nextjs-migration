// The original links to products with named routes,
// { name: category, params: { id } }, which resolve to /<category>/<id>.
export const productHref = (category: string, id: number) =>
	`/${category}/${id}`
