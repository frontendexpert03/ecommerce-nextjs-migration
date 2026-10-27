// next/navigation's hooks read from the app router, which only exists in a
// running Next app. setup.ts mocks usePathname to return the path set here,
// so tests can render a component "on" any page.

let pathname = '/'

export const setPathname = (path: string) => {
	pathname = path
}

export const getPathname = () => pathname
