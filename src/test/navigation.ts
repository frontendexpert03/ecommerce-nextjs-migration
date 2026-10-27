// next/navigation's hooks read from the app router, which only exists in a
// running Next app. setup.ts mocks usePathname to return the path set here,
// and useRouter to return testRouter, whose push/replace change that path.

let pathname = '/'

export const setPathname = (path: string) => {
	pathname = path
}

export const getPathname = () => pathname

export const testRouter = {
	push: (href: string) => setPathname(href),
	replace: (href: string) => setPathname(href),
	back: () => {},
	forward: () => {},
	refresh: () => {},
	prefetch: () => {},
}
