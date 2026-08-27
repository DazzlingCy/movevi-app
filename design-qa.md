# Design QA

- Source visual truth: `D:\E盘迁移文件\桌面\huaban-7080839317.jpg`
- Implementation target: `http://127.0.0.1:3000/` → 首页 → 打卡返购机费
- Intended viewport: 390 × 844 CSS px and 457 × 778 CSS px
- Source dimensions: 1200 × 2728 px
- Implementation screenshot: unavailable
- State: activity poster page, initial state
- Density normalization: not completed because the in-app browser capture connection failed before a rendered screenshot could be obtained

## Full-view comparison evidence

The source image was opened and inspected. It establishes a portrait Chinese promotional-poster direction with a pale yellow/lime palette, heavy black display type, strong yellow/green ribbons, dotted black card borders, dense information blocks, and a QR-led footer.

The implementation was built against that direction, but a browser-rendered screenshot could not be captured because the Codex in-app browser control runtime failed to initialize with `failed to write kernel assets: 系统找不到指定的路径。 (os error 3)`.

## Focused region comparison evidence

Blocked. The hero headline, information-card stack, QR footer, fixed consultation CTA, and mobile wrapping could not be compared from rendered evidence.

## Findings

- [P1] Browser-rendered visual evidence is missing.
  - Location: entire campaign poster page.
  - Evidence: source image is available, implementation screenshot is not.
  - Impact: typography scale, poster density, background crop, and mobile text wrapping cannot be signed off visually.
  - Fix: restore the in-app browser control connection, capture the campaign page at 390 × 844, then compare it with the source and address visible mismatches.

## Implementation checks completed

- TypeScript check passed with `npm run lint`.
- Production build passed with `npm run build`.
- `git diff --check` passed.
- The consultation CTA remains wired to the existing in-app online support page.

## Comparison history

- Iteration 1: implementation completed; visual comparison blocked before the first rendered capture.
- Iteration 2: reduced decorative-background opacity, added an opaque hero reading panel, changed every activity block to a non-overlapping title-row/content-row structure, increased body line-height, and enclosed the closing copy in an opaque panel. TypeScript and production build passed again. Browser-rendered comparison remains blocked by the same in-app browser initialization error.

final result: blocked
