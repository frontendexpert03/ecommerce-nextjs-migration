'use client'

import { useEffect } from 'react'
import { startCartSync } from '@/store/cart-store'

// Loads the saved cart after the first render, so server and client HTML
// match (docs/adr/0004), and keeps it in sync with other tabs.
export function CartSync() {
	useEffect(() => startCartSync(), [])
	return null
}
