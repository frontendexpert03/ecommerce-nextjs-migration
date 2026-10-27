'use client'

// Port of src/components/Buttons/button-go-back.vue. The original calls
// $router.go(-1), which is window.history.go(-1); calling it directly is the
// same step back without depending on a router.

export function ButtonGoBack() {
	return (
		<div className="mb-8 mt-10 w-4/5 max-w-6xl lg:mt-24">
			<a
				onClick={() => window.history.go(-1)}
				className="cursor-pointer text-start font-semibold text-black opacity-60 hover:opacity-100 active:translate-y-0.5"
			>
				Go Back
			</a>
		</div>
	)
}
