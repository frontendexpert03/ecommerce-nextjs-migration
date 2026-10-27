import { RouterLink } from '@/components/ui/RouterLink'
import { cx } from '@/lib/utils'

// Port of src/components/Category-Box/category-box.vue.

interface CategoryBoxProps {
	src: string
	category: string
	imgClass: string | string[]
}

export function CategoryBox({ src, category, imgClass }: CategoryBoxProps) {
	return (
		<RouterLink
			href={`/${category}`}
			className="group grid max-h-[14rem] w-full grid-cols-1 grid-rows-3 lg:max-h-[16rem]"
		>
			<img
				className={cx(
					'z-10 col-span-full row-span-2 row-start-1 aspect-square max-h-[18rem] place-self-center object-cover transition duration-300 group-hover:-translate-y-1 md:mb-3 md:max-h-[24rem]',
					imgClass,
				)}
				src={src}
				alt={`${category} category box image`}
				loading="lazy"
			/>
			<div className="col-span-full row-span-2 row-start-2 rounded-lg bg-k-grey duration-300 group-hover:translate-y-1"></div>
			<div className="z-10 col-span-full row-span-1 row-start-3 mb-5 flex flex-col items-center self-end">
				<h2 className="text-center text-xl font-bold uppercase text-black">
					{category}
				</h2>
				<div className="mt-2 flex flex-row items-center gap-2 text-sm font-semibold uppercase text-black opacity-50">
					<p>shop</p>
					<img src="/icons/right-arrow.svg" alt="arrow icon" />
				</div>
			</div>
		</RouterLink>
	)
}
