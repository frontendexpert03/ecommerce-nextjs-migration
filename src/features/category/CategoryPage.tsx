import { Footer } from '@/components/layout/Footer'
import { Navigation } from '@/components/layout/Navigation'
import { CategoryBoxContainer } from '@/components/sections/CategoryBoxContainer'
import { InfoSection } from '@/components/sections/InfoSection'
import { CategoryShowBox } from '@/features/category/components/CategoryShowBox'
import { getProductsOfType } from '@/lib/products'

// Port of src/pages/Category/category-page.vue. Like the original it has
// no wrapper element: the navigation, header and main sit side by side.

export function CategoryPage({ category }: { category: string }) {
	const products = getProductsOfType(category)

	return (
		<>
			<Navigation color="black" />
			<header className="flex w-full flex-col items-center bg-black lg:rounded-b-lg">
				<div className="my-10 flex w-4/5 max-w-6xl flex-col items-center justify-center lg:my-20">
					<h1 className="text-4xl font-semibold uppercase tracking-wider text-white antialiased">
						{category}
					</h1>
				</div>
			</header>
			<main className="main-container flex h-full w-screen flex-col items-center bg-white">
				{products.map((product, index) => (
					<CategoryShowBox
						key={index}
						item={product}
						category={category}
						data-test={`showbox-${product.category}-${product.id}`}
					/>
				))}
				<CategoryBoxContainer />
				<InfoSection />
				<Footer />
			</main>
		</>
	)
}
