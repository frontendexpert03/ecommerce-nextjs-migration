import { ButtonSolid } from '@/components/ui/ButtonSolid'
import { productHref } from '@/lib/routes'

// Port of src/pages/Landing/Components/landing-hero.vue. The spaces around
// each <br> are needed: some are hidden on small screens, and the space is
// then all that separates the words.

export function LandingHero() {
  return (
    <section className="flex w-full flex-col items-center overflow-hidden rounded-b-md bg-k-black">
      <div className="relative mt-20 flex max-w-6xl flex-col text-center transition-transform duration-200 sm:w-4/5 md:grid md:w-11/12 md:grid-cols-2 md:text-start lg:w-4/5">
        <div className="relative z-10 flex flex-col items-center justify-center pb-6 sm:ml-0 md:ml-10 md:items-start lg:ml-0">
          <p className="md:text-md text-sm font-light uppercase tracking-broad">
            new product
          </p>
          <h1 className="relative mt-4 text-5xl font-semibold uppercase text-white md:text-6xl">
            xx99 <br className="hidden md:block lg:hidden" /> mark II <br />{' '}
            Keyboard
          </h1>
          <p className="mb-10 mt-5 md:opacity-90">
            Enjoy a natural, light typing experience and exceptional{' '}
            <br className="hidden md:inline" /> build quality made for the
            passionate coding <br className="hidden md:inline" /> enthusiast.
          </p>
          <ButtonSolid
            to={productHref('keyboards', 2)}
            content="see product"
            color="light"
            add="font-bold mb-20"
          />
        </div>
        <div className="absolute bottom-0 z-0 aspect-auto w-full opacity-30 md:relative md:z-10 md:opacity-100">
          <img
            className="relative top-12 scale-[175%] md:top-20 md:scale-[175%] lg:top-12 lg:scale-150"
            src="/products/keyboards/up-nobg.webp"
            alt=""
          />
        </div>
      </div>
    </section>
  )
}
