import type { Metadata } from 'next'
import { CategoryPage } from '@/features/category/CategoryPage'
import { products } from '@/lib/data/products'
import { getCategoryPageMeta, toMetadata } from '@/lib/metadata'

// Only the three categories exist. Any other path falls through to
// not-found at the same URL, like the original's catch-all route
// (docs/adr/0008).
export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(products).map((category) => ({ category }))
}

export async function generateMetadata({
  params,
}: PageProps<'/[category]'>): Promise<Metadata> {
  const { category } = await params
  return toMetadata(getCategoryPageMeta(category)!)
}

export default async function Page({ params }: PageProps<'/[category]'>) {
  const { category } = await params
  return <CategoryPage category={category} />
}
