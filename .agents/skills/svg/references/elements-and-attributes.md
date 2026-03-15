# Elements And Attributes

## Usage Pattern

When recommending SVG structure, use this pattern:
1. Confirm objective (icon, logo, chart, decorative art, animation).
2. Define coordinate system (`viewBox`) and sizing strategy.
3. Select minimal element set.
4. Apply attributes with explicit reasoning.
5. Run the checklist before delivery.

## Element Groups And Scenarios

### Container And Structure

- `svg`: root container and coordinate system owner. Use in every SVG output.
- `g`: logical grouping for transforms, styling, and readability.
- `defs`: definitions for reusable or non-rendering resources.
- `symbol` + `use`: reusable icon primitives and sprite-like composition.

Typical scenario:
- Build icon sets, design systems, or repeated motifs across many assets.

### Basic Shapes

- `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`: fast, readable primitives.
- Prefer primitives before converting everything to `path`.

Typical scenario:
- UI icons, badges, simple logos, and geometric illustrations.

### Path And Advanced Geometry

- `path`: complex contours and custom geometry.
- Keep `d` concise and maintainable; avoid unnecessary control points.

Typical scenario:
- Brand marks, irregular illustrations, detailed icon silhouettes.

### Text

- `text`, `tspan`, `textPath`: textual graphics and curved text.
- For cross-platform stability in logos, outline text only when font availability is uncertain.

Typical scenario:
- Typographic marks, labeled diagrams, decorative lettering.

### Paint, Effects, And Clipping

- `linearGradient`, `radialGradient`, `pattern`: scalable paint systems.
- `filter`: blur/shadow/effects; use sparingly in high-frequency animations.
- `mask`, `clipPath`: reveal/crop operations with cleaner structure than path booleans.

Typical scenario:
- Hero graphics, product visuals, premium branding scenes.

### Animation

- `animate`, `animateTransform`, `animateMotion`: declarative SVG animation.
- Also combine with CSS and JavaScript depending on interaction needs.

Typical scenario:
- Micro-motion, loading indicators, orbit/follow-path behavior.

## High-Value Attributes

Use this matrix as a decision baseline.

| Attribute | Meaning | Recommended Usage | Typical Scenario |
| --- | --- | --- | --- |
| `viewBox` | Defines internal coordinate system | Always define explicitly | Responsive icon/logo scaling |
| `preserveAspectRatio` | Controls fitting behavior | Default `xMidYMid meet`; override only when required | Cropped hero/cover effects |
| `fill` | Interior paint | Prefer `currentColor` or CSS variables for theme-aware assets | Icons in UI themes |
| `stroke` | Outline paint | Pair with explicit `stroke-width`; validate at smallest size | Line icons/logomarks |
| `stroke-width` | Outline thickness | Keep consistent visual weight across set | Icon family consistency |
| `d` | Path data | Minimize points; keep direction intentional | Complex logo shapes |
| `transform` | Translate/scale/rotate/skew | Apply on groups when possible | Repeated layout transforms |
| `opacity` | Transparency | Use subtly; avoid stacking many semi-transparent layers | Soft overlays |
| `filter` | Effect pipeline | Limit runtime-heavy filters in animated contexts | Static shadows/glows |
| `mask` | Alpha/luminance reveal | Use for reveal transitions and compositing | Complex reveal art |
| `clip-path` | Geometric clipping | Prefer for deterministic crop boundaries | Avatar/icon clipping |
| `href` on `use` | Reuse definitions | Deduplicate repeating geometry | Sprite-like icon systems |

## Frequent Pitfalls

- Missing `viewBox`, causing scaling breakage across sizes.
- Overusing `path` when primitives are clearer and lighter.
- Mixing coordinate assumptions (percent vs user units) without validation.
- Heavy filter stacks in animations, causing frame drops.
- Inline hardcoded colors that block theming and dark mode adaptation.

## Delivery Checklist

- [ ] Root `svg` includes explicit `viewBox`.
- [ ] Element set is minimal and semantically grouped (`g`, `defs`, `use` when needed).
- [ ] Paint strategy supports theme requirements (`currentColor`/variables where needed).
- [ ] Complex paths are simplified to the minimum reliable geometry.
- [ ] Effects (`filter`/`mask`/`clipPath`) are justified and performance-checked.

## Example Assets

- Practical snippet: [SVG Practical Examples](../assets/examples.md#1-elements-and-attributes-example)
