---
"@plumage/tokens": major
"@plumage/ui": minor
---

Replace the VibeCheck placeholder brand with **Sparrow**: a russet accent on warm stone
neutrals, medium radii, calm motion, comfortable density. New primitive ramps `russet` and
`stone`; `mauve` is removed.

Font roles are now `font.family.body`, `display`, `numeric`, and `mono`; `sans` is renamed
`body` (Tailwind keeps `font-sans` for it, and adds `font-numeric`). Finch and Sparrow name
Fontshare families (Switzer, Cabinet Grotesk, Satoshi) with Inter as the fallback; no font
files are bundled.
