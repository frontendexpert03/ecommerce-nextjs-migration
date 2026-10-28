import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ProductPage } from '@/features/product/ProductPage'
import { products } from '@/lib/data/products'
import { getProductPageMeta, toMetadata } from '@/lib/metadata'
import { getProduct, isCategory } from '@/lib/products'

// The seven products are prerendered. Other ids still reach this page, as
// they do in the original (docs/adr/0008):
// - an unknown category shows not-found at the same URL (catch-all route);
// - an unknown product redirects to /404 (the product route's guard);
// - the id is read with parseInt, so /keyboards/1abc shows product 1.

export function generateStaticParams() {
  return Object.values(products)
    .flat()
    .map((product) => ({ category: product.category, id: String(product.id) }))
}

async function resolve(params: PageProps<'/[category]/[id]'>['params']) {
  const { category, id } = await params
  if (!isCategory(category)) notFound()

  const productId = parseInt(id)
  const product = getProduct(category, productId)
  if (!product) redirect('/404')

  return { category, productId, product }
}

export async function generateMetadata({
  params,
}: PageProps<'/[category]/[id]'>): Promise<Metadata> {
  const { product } = await resolve(params)
  return toMetadata(getProductPageMeta(product))
}

export default async function Page({ params }: PageProps<'/[category]/[id]'>) {
  const { category, productId } = await resolve(params)
  return <ProductPage category={category} productId={productId} />
}
