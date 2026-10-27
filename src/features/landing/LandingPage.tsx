import { Footer } from '@/components/layout/Footer'
import { Navigation } from '@/components/layout/Navigation'
import { CategoryBoxContainer } from '@/components/sections/CategoryBoxContainer'
import { InfoSection } from '@/components/sections/InfoSection'
import { LandingGrid } from '@/features/landing/components/LandingGrid'
import { LandingHero } from '@/features/landing/components/LandingHero'

// Port of src/pages/Landing/landing-page.vue.

export function LandingPage() {
	return (
		<div className="main-container flex h-full w-screen flex-col items-center bg-white">
			<Navigation color="k-black" />
			<main className="h-full w-screen">
				<LandingHero />
				<CategoryBoxContainer />
				<LandingGrid />
				<InfoSection />
			</main>
			<Footer />
		</div>
	)
}
