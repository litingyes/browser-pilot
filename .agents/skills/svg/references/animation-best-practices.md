# Animation Best Practices

## Animation Method Selection

Use this decision order:
1. Prefer CSS for simple state transitions (hover, focus, active, mount).
2. Use SVG declarative animation (`animate*`) for self-contained timeline motion.
3. Use JavaScript (`requestAnimationFrame`) for interaction-driven or physics-like motion.

## Technique Matrix

| Technique | Best For | Strength | Trade-Off |
| --- | --- | --- | --- |
| CSS transitions/animations | UI states and simple loops | Easy integration with app states | Limited for complex path choreography |
| SVG declarative (`animate`, `animateTransform`, `animateMotion`) | Standalone SVG timelines | Clear SVG-local logic | Team familiarity may vary |
| JavaScript + `requestAnimationFrame` | Interactive, data-driven motion | Full control and sync | Higher implementation complexity |

## Motion Standards

- Keep motion purposeful; animation should explain state, not distract.
- Start with short durations and clear easing; expand only when justified.
- Animate transform/opacity first when possible.
- Avoid animating expensive effect stacks on every frame.
- Document loop behavior and stopping conditions.

## Performance Guardrails

- Minimize path complexity before animating.
- Prefer group-level transforms over repeated per-node transforms.
- Reduce simultaneous animated elements on low-power contexts.
- Avoid animating heavy blur/filter combinations continuously.
- Test frame stability in realistic device/browser combinations.

## Accessibility And Fallback

- Respect `prefers-reduced-motion`; provide reduced or static alternatives.
- Ensure animation does not hide essential information.
- Avoid flashes and rapid contrast changes that can trigger discomfort.
- Keep interaction discoverable even with animation disabled.

## Implementation Decision Tree

1. Is animation purely decorative?
   - Yes: keep subtle and easy to disable.
   - No: ensure state meaning still works without motion.
2. Is motion tied to user interaction/state?
   - Yes: prefer CSS or JavaScript integration with app state.
   - No: declarative SVG timeline can be preferred.
3. Are performance constraints strict (many instances, low-end devices)?
   - Yes: simplify geometry and avoid filter-heavy animation.
   - No: allow richer effects with explicit budget checks.

## Review Checklist

- [ ] Chosen animation method matches interaction and complexity needs.
- [ ] Duration/easing values are consistent with product motion language.
- [ ] Performance risks (path density, filter load, element count) are assessed.
- [ ] Reduced-motion fallback is implemented and tested.
- [ ] Core meaning remains clear when animation is disabled.

## Example Assets

- Practical snippets: [SVG Practical Examples](../assets/examples.md#3-animation-examples)
