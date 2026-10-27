const VOID_ELEMENTS = new Set([
	'area',
	'br',
	'col',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'source',
])

/**
 * Turns rendered markup into indented text, one tag or text run per line, so
 * the Vue and React output can be compared and diffed. It keeps tag names,
 * attribute values and text exactly, and ignores only what the two
 * frameworks produce differently but the browser renders the same:
 *
 * - comment nodes (Vue's `<!--v-if-->` placeholders)
 * - attribute order
 * - how text is split into nodes (`$ {price}` in JSX is two text nodes)
 * - runs of whitespace, and whitespace at the edges of a text run
 */
export function serialize(root: Element): string {
	const lines: string[] = []
	writeChildren(root, 0, lines)
	return lines.map((line) => line + '\n').join('')
}

function writeChildren(parent: Element, depth: number, lines: string[]) {
	let text = ''
	const flushText = () => {
		const normalised = collapse(text)
		if (normalised) lines.push(indent(depth) + normalised)
		text = ''
	}

	for (const node of parent.childNodes) {
		if (node.nodeType === Node.TEXT_NODE) {
			text += node.textContent
		} else if (node.nodeType === Node.ELEMENT_NODE) {
			flushText()
			writeElement(node as Element, depth, lines)
		}
	}
	flushText()
}

function writeElement(element: Element, depth: number, lines: string[]) {
	const tag = element.tagName.toLowerCase()
	const attributes = [...element.attributes]
		.map(({ name, value }) => ` ${name}="${collapse(value)}"`)
		.sort()
		.join('')

	lines.push(`${indent(depth)}<${tag}${attributes}>`)
	writeChildren(element, depth + 1, lines)
	if (!VOID_ELEMENTS.has(tag)) lines.push(`${indent(depth)}</${tag}>`)
}

const collapse = (value: string) => value.replace(/\s+/g, ' ').trim()

const indent = (depth: number) => '  '.repeat(depth)
