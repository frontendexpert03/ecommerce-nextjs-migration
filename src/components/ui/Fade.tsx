'use client'

import {
	cloneElement,
	useEffect,
	useState,
	type CSSProperties,
	type ReactElement,
	type Ref,
} from 'react'
import { cx } from '@/lib/utils'

// Port of Vue's <Transition> as the original app uses it: the default "v"
// classes styled in globals.css (fade in over 0.3s, out over 0.2s), and no
// transition on first render. mode="show" keeps the element and sets
// display: none, like v-show; mode="if" removes it, like v-if.
//
// The steps follow Vue's runtime: add the *-from and *-active classes, wait
// two animation frames, swap *-from for *-to, then wait for the CSS
// transition to end (or its duration, if no transitionend event arrives).

type Stage =
	'shown' | 'hidden' | 'enter-from' | 'enter-to' | 'leave-from' | 'leave-to'

const STAGE_CLASSES: Record<Stage, string> = {
	shown: '',
	hidden: '',
	'enter-from': 'v-enter-from v-enter-active',
	'enter-to': 'v-enter-active v-enter-to',
	'leave-from': 'v-leave-from v-leave-active',
	'leave-to': 'v-leave-active v-leave-to',
}

interface FadeProps {
	show: boolean
	mode?: 'show' | 'if'
	/** One DOM element, such as a <div>; Fade sets its class, style and ref. */
	children: ReactElement<{
		className?: string
		style?: CSSProperties
		ref?: Ref<HTMLElement>
	}>
}

export function Fade({ show, mode = 'show', children }: FadeProps) {
	// A callback ref into state, so the effect re-runs once the element exists
	// (in "if" mode it mounts at the start of the fade-in).
	const [element, setElement] = useState<HTMLElement | null>(null)
	const [stage, setStage] = useState<Stage>(show ? 'shown' : 'hidden')
	const [lastShow, setLastShow] = useState(show)

	if (show !== lastShow) {
		setLastShow(show)
		setStage(show ? 'enter-from' : 'leave-from')
	}

	useEffect(() => {
		if (!element) return

		if (stage === 'enter-from' || stage === 'leave-from') {
			const entering = stage === 'enter-from'
			let frame = requestAnimationFrame(() => {
				frame = requestAnimationFrame(() => {
					// With no CSS transition the step ends at once, as in Vue.
					if (transitionTimeout(element) > 0)
						setStage(entering ? 'enter-to' : 'leave-to')
					else setStage(entering ? 'shown' : 'hidden')
				})
			})
			return () => cancelAnimationFrame(frame)
		}

		if (stage === 'enter-to' || stage === 'leave-to') {
			const end = stage === 'enter-to' ? 'shown' : 'hidden'
			return onTransitionEnd(element, () => setStage(end))
		}
	}, [stage, element])

	if (stage === 'hidden' && mode === 'if') return null

	return cloneElement(children, {
		ref: setElement,
		className: cx(children.props.className, STAGE_CLASSES[stage]),
		style:
			stage === 'hidden'
				? { ...children.props.style, display: 'none' }
				: children.props.style,
	})
}

const toMs = (time: string) =>
	Number(time.slice(0, -1).replace(',', '.')) * 1000

/** The longest transition delay + duration on the element, as Vue computes it. */
function transitionTimeout(element: HTMLElement): number {
	const styles = getComputedStyle(element)
	const delays = (styles.transitionDelay || '').split(', ')
	const durations = (styles.transitionDuration || '').split(', ')
	return Math.max(
		0,
		...durations.map((duration, i) => toMs(duration) + toMs(delays[i] ?? '0s')),
	)
}

function onTransitionEnd(element: HTMLElement, done: () => void) {
	const propCount = (getComputedStyle(element).transitionDuration || '').split(
		', ',
	).length
	let ended = 0

	const finish = () => {
		cleanup()
		done()
	}
	const onEnd = (event: TransitionEvent) => {
		if (event.target === element && ++ended >= propCount) finish()
	}
	const timer = setTimeout(finish, transitionTimeout(element) + 1)
	element.addEventListener('transitionend', onEnd)

	function cleanup() {
		clearTimeout(timer)
		element.removeEventListener('transitionend', onEnd)
	}
	return cleanup
}
