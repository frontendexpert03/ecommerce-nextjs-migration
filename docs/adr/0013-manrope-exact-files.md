# 0013. Self-host the exact Manrope files Google Fonts serves

- Status: Accepted
- Date: 2026-10-27
- Supersedes: [0010](0010-manrope-via-next-font.md)

## Context

ADR 0010 loaded Manrope with `next/font/google`. The visual parity tests (ADR 0014) then compared the two apps pixel by pixel and found text drawn slightly differently in some places, for example bold 20px "XX59" in the desktop cart.

Comparing the font files each app downloads showed why. They are different builds of Manrope:

| App                                  | Latin file                     | Bytes  | MD5 (start)  |
| ------------------------------------ | ------------------------------ | ------ | ------------ |
| Vue (Google Fonts stylesheet)        | `xn7gYHE41ni1AdIRggexSg.woff2` | 24,836 | `938c6e8019` |
| Next (`next/font`, fetched at build) | `d4b605c61b941c57-s.p….woff2`  | 24,576 | `101877a7a9` |

`next/font` also registers one face for the weight range 200–800, where Google's stylesheet has 42 faces: 7 weights × 6 character subsets.

## Decision

- Download Google's stylesheet for the original's exact request (`family=Manrope:wght@200;300;400;500;600;700;800&display=swap`) as Chrome receives it, and the six files it references (one variable font per subset).
- Serve those files from `public/fonts/manrope/` and copy the 42 `@font-face` rules into `src/app/fonts.css`, changing only the URLs. The file header says how it was generated, and Prettier ignores it.
- Preload the latin file in the root layout with React's `preload()`, as `next/font` did.
- Return the Tailwind theme to the original's line, `Manrope: ['Manrope', 'sans-serif']`, so `tailwind.config.ts` again matches the Vue project exactly (ADR 0003).

## Consequences

- Both apps draw text with byte-identical font files and the same `@font-face` rules; the latin file's checksum matches the one the Vue app loads.
- No request goes to Google at runtime, so ADR 0010's privacy and speed reasons still hold.
- The files are Manrope v20, as served on 2026-10-27. If Google updates Manrope, the Vue app changes with it and the port does not. Re-running the download is a one-off script; the parity tests would flag the difference.
- During loading, the fallback is plain `sans-serif`, as in the original; `next/font`'s size-adjusted fallback is gone.

## Alternatives considered

- **Keep `next/font`:** idiomatic, but measurably not the same font file.
- **Link the Google Fonts stylesheet, as the original does:** identical by construction, but slower and sends visitors' IP addresses to Google.
- **`next/font/local` with the downloaded files:** could pin the same files, but cannot reproduce Google's per-subset `unicode-range` rules without one font loader per subset.
