import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { setPathname } from './navigation'

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
