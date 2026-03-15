# SVG Practical Examples

## 1) Elements And Attributes Example

### Scenario
Responsive icon with reusable shape, theme-friendly paint, and clipping.

```svg
<svg viewBox="0 0 24 24" role="img" aria-labelledby="iconTitle iconDesc" xmlns="http://www.w3.org/2000/svg">
  <title id="iconTitle">Camera icon</title>
  <desc id="iconDesc">A rounded camera body with a centered lens and status dot.</desc>
  <defs>
    <clipPath id="clipFrame">
      <rect x="2" y="4" width="20" height="16" rx="3" />
    </clipPath>
    <circle id="lens" cx="12" cy="12" r="4" />
  </defs>
  <g clip-path="url(#clipFrame)" fill="none" stroke="currentColor" stroke-width="1.75">
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <use href="#lens" />
    <circle cx="18" cy="8" r="1" fill="currentColor" stroke="none" />
  </g>
</svg>
```

Key points:
- `viewBox` ensures scalable rendering.
- `currentColor` enables theme integration.
- `defs` + `use` avoids repeated geometry.

## 2) Icon/Logo Example

### Scenario
Single-source icon that supports monochrome UI and brand variant extension.

```svg
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none">
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="5" y="5" width="22" height="22" rx="6" />
    <path d="M11 17h10M16 12v10" />
  </g>
</svg>
```

Usage notes:
- Use `currentColor` for UI icon mode.
- For brand mode, swap `currentColor` to token variables (for example `var(--brand-primary)`).
- Validate readability at 16/20/24/32 px.

## 3) Animation Examples

### 3.1 CSS State Animation (preferred for UI states)

```svg
<svg class="icon-spin-on-hover" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <g class="gear">
    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" stroke-width="1.5" />
  </g>
</svg>
```

```css
.icon-spin-on-hover .gear {
  transform-origin: 12px 12px;
  transition: transform 180ms ease-out;
}
.icon-spin-on-hover:hover .gear,
.icon-spin-on-hover:focus-visible .gear {
  transform: rotate(20deg);
}
@media (prefers-reduced-motion: reduce) {
  .icon-spin-on-hover .gear {
    transition: none;
  }
}
```

### 3.2 SMIL Loop Animation (self-contained timeline)

```svg
<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="10" cy="20" r="6" fill="currentColor">
    <animate attributeName="cx" from="10" to="110" dur="1.2s" repeatCount="indefinite" />
  </circle>
</svg>
```

### 3.3 JavaScript rAF Animation (interactive control)

```html
<svg id="followDot" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <circle id="dot" cx="20" cy="40" r="8" fill="currentColor"></circle>
</svg>
<script>
  const dot = document.getElementById("dot");
  let targetX = 20;
  document.getElementById("followDot").addEventListener("pointermove", (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    targetX = ((e.clientX - box.left) / box.width) * 200;
  });
  let x = 20;
  function tick() {
    x += (targetX - x) * 0.15;
    dot.setAttribute("cx", x.toFixed(2));
    requestAnimationFrame(tick);
  }
  tick();
</script>
```

## 4) Engineering Integration Example

### Scenario
Accessible, theme-ready, stateful icon button.

```html
<button class="icon-btn" type="button" aria-label="Add item">
  <svg viewBox="0 0 24 24" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
</button>
```

```css
.icon-btn {
  color: var(--icon-color, #1f2937);
  background: transparent;
  border: 1px solid currentColor;
}
.icon-btn:hover {
  color: var(--icon-hover, #111827);
}
.icon-btn:focus-visible {
  outline: 2px solid var(--focus, #2563eb);
  outline-offset: 2px;
}
.icon-btn:disabled {
  color: #9ca3af;
}
```

Checklist:
- `viewBox` present
- theme via `currentColor`/tokens
- keyboard focus visible
- reduced motion strategy defined when motion exists
