import { ButtonSolid } from '@/components/ui/ButtonSolid'

// Port of src/pages/404/404-page.vue.

export function NotFoundPage() {
	return (
		<main className="flex h-screen w-screen flex-col items-center justify-center bg-black text-white">
			<div className="flex max-h-screen flex-col items-center justify-center gap-6 p-10 text-center lg:w-1/3">
				<h1 className="text-7xl font-black text-k-main">404</h1>
				<p className="text-md tracking-widest opacity-70">
					Stare at the abyss and the abyss stares back at you!
				</p>
				<ButtonSolid
					to="/"
					color="light"
					content="To Safety"
					size="big"
					add="font-bold mt-8"
				/>
			</div>
		</main>
	)
}
