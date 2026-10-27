import type { Metadata } from 'next'
import { LandingPage } from '@/features/landing/LandingPage'
import { getLandingPageMeta, toMetadata } from '@/lib/metadata'

export const metadata: Metadata = toMetadata(getLandingPageMeta())

export default function Page() {
	return <LandingPage />
}
