# Engineering Techniques

## 1) Accessibility

### Goal
Ensure SVG remains understandable and operable for assistive technology users.

### Recommended Practices

- Distinguish informative vs decorative SVG up front.
- Informative inline SVG: use `role="img"` and accessible labeling (`title`/`desc` or equivalent text mapping).
- Decorative SVG: remove from accessibility tree when appropriate.
- Keep focus styles visible if SVG is interactive.

### Anti-Patterns

- Relying on shape alone to convey critical meaning.
- Missing textual alternatives for semantic icons.
- Interactive SVG without keyboard/focus handling.

### Checklist

- [ ] Informative/decorative intent is explicitly declared.
- [ ] Accessible name/description path is present when required.
- [ ] Interactive states are keyboard-accessible and visibly focused.

## 2) Performance And Size Optimization

### Goal
Deliver fast-rendering SVG with minimal transfer and runtime cost.

### Recommended Practices

- Simplify path data and remove invisible or duplicate nodes.
- Reuse geometry with `defs` + `use` where repetition exists.
- Limit filters and nested masks in frequently rendered assets.
- Prefer static pre-optimization in build pipelines for shared icon packs.

### Anti-Patterns

- Large hidden layers exported from design tools.
- Repeated complex paths copied inline instead of reused.
- Filter-heavy animation in dense UI surfaces.

### Checklist

- [ ] SVG payload and node count are reviewed against context budget.
- [ ] Reusable geometry is deduplicated.
- [ ] Runtime-heavy effects are justified and scoped.

## 3) Responsive Adaptation

### Goal
Maintain visual integrity across varying container sizes and aspect ratios.

### Recommended Practices

- Always define `viewBox`.
- Control scaling behavior with explicit `preserveAspectRatio`.
- Validate at minimum/maximum expected size breakpoints.
- Use percentage or container-driven sizing when embedding in responsive layouts.

### Anti-Patterns

- Fixed pixel assumptions without `viewBox`.
- Unverified cropping/stretching when aspect ratio changes.

### Checklist

- [ ] `viewBox` and sizing strategy are documented.
- [ ] Aspect-ratio behavior is tested on target container states.
- [ ] Small and large size rendering remain legible.

## 4) Theming And Design-System Integration

### Goal
Make SVG adapt cleanly to themes and token systems.

### Recommended Practices

- Use `currentColor` for single-tone icons in UI surfaces.
- Map multi-tone palettes to design tokens or CSS variables.
- Keep brand-specific colors isolated for controlled override.
- Align icon variants (outline, filled, disabled) with component states.

### Anti-Patterns

- Hardcoded colors that break dark mode.
- Inconsistent token naming across icon families.

### Checklist

- [ ] Color strategy (`currentColor`/tokens/brand constants) is explicit.
- [ ] Dark/light and high-contrast scenarios are covered.
- [ ] Variant behavior aligns with component state definitions.

## 5) Interaction And State Management

### Goal
Support predictable hover/focus/active/disabled behavior in UI workflows.

### Recommended Practices

- Model SVG states as part of component state, not one-off overrides.
- Keep transitions short and meaningful for user feedback.
- Separate static geometry from stateful paint/motion classes.
- Ensure pointer and keyboard interactions share equivalent visual feedback.

### Anti-Patterns

- State-specific SVG duplication instead of style/state layering.
- Hover-only feedback with no keyboard equivalent.

### Checklist

- [ ] All interaction states are defined and testable.
- [ ] State transitions are consistent with product motion standards.
- [ ] Keyboard and pointer paths provide equivalent feedback.

## Example Assets

- Practical snippet: [SVG Practical Examples](../assets/examples.md#4-engineering-integration-example)
