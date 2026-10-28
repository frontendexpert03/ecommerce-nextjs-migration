import { Footer } from '@/components/layout/Footer'
import { Navigation } from '@/components/layout/Navigation'
import { InfoSection } from '@/components/sections/InfoSection'
import { YouMayAlsoLike } from '@/components/sections/YouMayAlsoLike'
import { ProductCore } from '@/features/product/components/ProductCore'
import { ProductFeatures } from '@/features/product/components/ProductFeatures'
import { ProductImageGrid } from '@/features/product/components/ProductImageGrid'
import { preloadMainImage } from '@/lib/preload'
import { getProduct } from '@/lib/products'

// Port of src/pages/Product/product-page.vue. The route checks that the
// product exists before rendering this page, as the original's guard does.

interface ProductPageProps {
	category: string
	productId: number
}

export function ProductPage({ category, productId }: ProductPageProps) {
	const item = getProduct(category, productId)!
	preloadMainImage(item.src)

	return (
		<main className="flex h-full w-screen flex-col items-center bg-white">
			<Navigation color="black" />
			<ProductCore item={item} />
			<ProductFeatures features={item.features} inthebox={item.inthebox} />
			<ProductImageGrid
				topSrc={item.topSrc}
				botSrc={item.botSrc}
				rightSrc={item.rightSrc}
			/>
			<YouMayAlsoLike productCategory={category} productId={productId} />
			<InfoSection />
			<Footer />
		</main>
	)
}
