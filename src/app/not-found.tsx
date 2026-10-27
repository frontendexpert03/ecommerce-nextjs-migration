import type { Metadata } from 'next'
import { NotFoundPage } from '@/features/not-found/NotFoundPage'
import { get404PageMeta, toMetadata } from '@/lib/metadata'

// Shown for every unmatched URL, including /404, which unknown products
// redirect to (docs/adr/0008).
export const metadata: Metadata = toMetadata(get404PageMeta())

export default function NotFound() {
	return <NotFoundPage />
}
