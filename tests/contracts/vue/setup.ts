import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/dom'
import { cleanup } from '@testing-library/vue'
import { afterEach } from 'vitest'

// The original marks elements with data-test (also used by Playwright).
configure({ testIdAttribute: 'data-test' })

afterEach(() => {
	cleanup()
})
