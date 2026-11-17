---
"@plumage/tokens": minor
"@plumage/ui": minor
---

Add `Progress`: a bar for how much of a limit is used or done, with accent, positive,
warning, and neutral tones. Values past the limit draw a full bar. Its thickness is the
new component token `progress.track.height` (`h-progress-track`), which follows density.
Sparrow's budget page uses it for spending against each category's budget.
