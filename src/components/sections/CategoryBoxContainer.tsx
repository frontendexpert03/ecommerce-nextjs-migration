import { CategoryBox } from '@/components/sections/CategoryBox'

// Port of src/components/Category-Box/category-box-container.vue.

const categories = [
  {
    src: '/products/categories/category-keyboards.webp',
    category: 'keyboards',
    imgClass: [''],
  },
  {
    src: '/products/categories/category-keycaps.webp',
    category: 'keycaps',
    imgClass: ['scale-90'],
  },
  {
    src: '/products/categories/category-deskmats.webp',
    category: 'deskmats',
    imgClass: ['-mb-6', 'md:-mb-5', 'md:scale-110'],
  },
]

export function CategoryBoxContainer() {
  return (
    <div className="mt-16 flex h-full w-full flex-col items-center bg-white lg:mt-32">
      <div className="flex w-4/5 flex-col items-center gap-4 md:h-[17rem] md:w-11/12 md:max-w-6xl md:flex-row md:justify-center md:gap-6 lg:w-4/5">
        {categories.map((item, index) => (
          <CategoryBox
            key={index}
            src={item.src}
            category={item.category}
            imgClass={item.imgClass}
          />
        ))}
      </div>
    </div>
  )
}
