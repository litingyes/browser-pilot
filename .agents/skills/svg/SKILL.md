---
name: svg
description: Define practical SVG standards for element/attribute usage, icon and logo design, animation decisions, and engineering integration. Use when users need SVG creation guidance, SVG code reviews, icon/logo specifications, animation implementation, or frontend SVG optimization and accessibility checks.
---

# SVG Engineering

## Purpose

Use this skill to standardize SVG authoring and integration workflows:
- Select the right SVG elements and attributes for the target outcome.
- Build scalable, theme-friendly icons and logos.
- Choose animation techniques with performance and accessibility guardrails.
- Apply production-ready practices for responsive behavior and interaction states.

## Scope And Boundaries

- Cover technical SVG standards and engineering best practices only.
- Do not assume brand language, visual style, or business-specific design constraints.
- If key constraints are missing (brand palette, size targets, motion style, browser support), ask for clarification first.
- Keep this file as routing only; detailed guidance lives in `references/`.

## Core Principles

1. **Semantics before complexity**: prefer simple primitives and structure over overbuilt paths.
2. **Coordinate-system clarity**: always reason from `viewBox` and scaling behavior.
3. **Accessible by default**: include labeling and reduced-motion strategy from the start.
4. **Performance is part of design**: optimize structure and animation budget early.
5. **Reusable output**: support theming, responsiveness, and maintainable handoff.

## Module Routing

Read modules based on user intent:

1. **Element and attribute selection**
   - See [Elements and Attributes](references/elements-and-attributes.md)
2. **Icon and logo standards**
   - See [Icon and Logo Best Practices](references/icon-logo-best-practices.md)
3. **Animation approach and constraints**
   - See [Animation Best Practices](references/animation-best-practices.md)
4. **Engineering integration patterns**
   - See [Engineering Techniques](references/engineering-techniques.md)
5. **Ready-to-use practical snippets**
   - See [SVG Practical Examples](assets/examples.md)

## Minimal Output Contract

For any SVG task, always provide:
- Selected approach and why it matches the scenario.
- Critical parameters (`viewBox`, sizing strategy, color strategy, naming/reuse model).
- Accessibility and compatibility considerations.
- Performance trade-offs and optimization notes.
- An executable checklist for implementation or review.
