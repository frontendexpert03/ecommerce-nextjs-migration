import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { setPathname } from './navigation'

// The original marks elements with data-test (also used by Playwright).
configure({ testIdAttribute: 'data-test' })

vi.mock('next/navigation', async (importOriginal) => {
	const { getPathname } = await import('./navigation')
	return {
		...(await importOriginal<typeof import('next/navigation')>()),
		usePathname: () => getPathname(),
	}
})

// Vitest runs without globals, so RTL cannot register its own cleanup.
afterEach(() => {
	cleanup()
	setPathname('/')
})
