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
 * - runs of whitespace (collapsed to one space)
 * - whitespace at the start or end of an element's content
 *
 * Whitespace next to a sibling element is kept: in
 * `exceptional <br class="hidden md:inline" /> build` the space is all that
 * separates the words when the <br> is hidden. Text lines are quoted so
 * such spaces show in the golden files.
 *
 * `ignoreAttributes` drops named attributes too. Use it only for Vue
 * artifacts the port deliberately doesn't copy, and say why in the spec.
 */
export function serialize(
	root: Element,
	{ ignoreAttributes = [] }: SerializeOptions = {},
): string {
	const lines: string[] = []
	writeChildren(root, 0, lines, new Set(ignoreAttributes))
	return lines.map((line) => line + '\n').join('')
}

export interface SerializeOptions {
	ignoreAttributes?: string[]
}

function writeChildren(
	parent: Element,
	depth: number,
	lines: string[],
	ignored: Set<string>,
) {
	// Merge adjacent text (across comments) into runs between elements.
	const parts: (string | Element)[] = []
	for (const node of parent.childNodes) {
		if (node.nodeType === Node.TEXT_NODE) {
			const last = parts.at(-1)
			if (typeof last === 'string')
				parts[parts.length - 1] = last + node.textContent
			else parts.push(node.textContent ?? '')
		} else if (node.nodeType === Node.ELEMENT_NODE) {
			parts.push(node as Element)
		}
	}

	parts.forEach((part, i) => {
		if (typeof part !== 'string') {
			writeElement(part, depth, lines, ignored)
			return
		}
		let text = part.replace(/\s+/g, ' ')
		if (i === 0) text = text.trimStart()
		if (i === parts.length - 1) text = text.trimEnd()
		if (text) lines.push(indent(depth) + JSON.stringify(text))
	})
}

function writeElement(
	element: Element,
	depth: number,
	lines: string[],
	ignored: Set<string>,
) {
	const tag = element.tagName.toLowerCase()
	const attributes = [...element.attributes]
		.filter(({ name }) => !ignored.has(name))
		.map(({ name, value }) => ` ${name}="${collapse(value)}"`)
		.sort()
		.join('')

	lines.push(`${indent(depth)}<${tag}${attributes}>`)
	writeChildren(element, depth + 1, lines, ignored)
	if (!VOID_ELEMENTS.has(tag)) lines.push(`${indent(depth)}</${tag}>`)
}

const collapse = (value: string) => value.replace(/\s+/g, ' ').trim()

const indent = (depth: number) => '  '.repeat(depth)
