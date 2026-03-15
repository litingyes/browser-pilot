# Icon And Logo Best Practices

## Design Targets

Define these constraints before implementation:
- Primary usage context (app icon, navbar icon, favicon, brand lockup, print).
- Minimum display size and expected density range.
- Light/dark theme requirements.
- Whether stroke-based and filled variants are both needed.

If any are missing, ask before finalizing output.

## Structural Standards

- Always provide `viewBox`; avoid relying on fixed width/height only.
- Keep geometry centered and aligned to a predictable grid.
- Prefer primitives and grouped layers before path flattening.
- Use `defs` + `use` for repeating motifs across a family.
- Keep layer naming and group semantics clean for handoff and review.

## Visual Consistency Rules

- **Grid discipline**: design against a base grid (for example 24 or 32 units).
- **Optical balance**: center by eye when strict geometry appears visually off.
- **Stroke strategy**: define consistent stroke widths across an icon set.
- **Corner logic**: keep corner radius language consistent within a family.
- **Negative space**: reserve breathing room so symbols remain legible at small sizes.

## Color And Theming

- For UI icons, default to `fill="currentColor"` unless multi-tone is required.
- For multi-tone systems, map colors to CSS variables for theme switching.
- Avoid hidden contrast failures; test on both dark and light surfaces.
- For logos, keep canonical brand colors and define monochrome fallback.

## Accessibility And Semantics

- Informative inline SVG: include `role`, `title`, and `desc` where needed.
- Decorative SVG: mark as hidden from assistive tech when appropriate.
- Ensure text alternatives exist when icon meaning is not obvious.

## Export And Handoff Rules

- Keep source editable; avoid premature flattening unless delivery requires it.
- Remove editor metadata and unused defs before delivery.
- Verify paths are simplified and duplicate nodes removed.
- Provide naming convention and versioning (for example `icon-name-24.svg`).

## Review Checklist

- [ ] `viewBox` is present and validated at target sizes.
- [ ] Small-size readability passes at minimum size target.
- [ ] Stroke/fill behavior is consistent with icon family rules.
- [ ] Theme behavior works for light/dark backgrounds.
- [ ] Accessibility semantics match informative vs decorative intent.
- [ ] Output is optimized (no unused nodes, redundant groups, or hidden bloat).

## Example Assets

- Practical snippet: [SVG Practical Examples](../assets/examples.md#2-iconlogo-example)
