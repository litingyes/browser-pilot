# Element Interaction Operations

This document covers actions for interacting with and manipulating DOM elements.

## Common Parameters

All interaction actions accept these common parameters:
- `selectorOrRef`: string (CSS selector or element reference from snapshot)
- `timeout`: number (optional, default: 5000ms - Maximum time to wait for element to be interactable)
- `force`: boolean (optional, default: false - Bypass interactability checks)

---

### CLICK
Perform a left mouse click on an element.

**Parameters:**
- `button` (optional): 'left' | 'middle' | 'right' (default: 'left')
- `clickCount` (optional): number (default: 1)
- `delay` (optional): number (ms between mousedown and mouseup, default: 0)

**Usage Example:**
```typescript
await dispatchAction('CLICK', {
  selectorOrRef: 'button#submit',
  delay: 100
}, tabId);
```

---

### DBLCLICK
Perform a double left mouse click on an element.

**Usage Example:**
```typescript
await dispatchAction('DBLCLICK', {
  selectorOrRef: '.file-icon'
}, tabId);
```

---

### HOVER
Move the mouse cursor over an element.

**Parameters:**
- `modifiers` (optional): number (Keyboard modifiers: 1=Alt, 2=Ctrl, 4=Meta, 8=Shift)

**Usage Example:**
```typescript
await dispatchAction('HOVER', {
  selectorOrRef: '.dropdown-trigger'
}, tabId);
```

---

### FILL
Clear an input field and fill it with text.

**Parameters:**
- `value`: string (Text to enter into the field)

**Usage Example:**
```typescript
await dispatchAction('FILL', {
  selectorOrRef: 'input#email',
  value: 'user@example.com'
}, tabId);
```

---

### TYPE_TEXT
Type text into the currently focused element (appends to existing content).

**Parameters:**
- `text`: string (Text to type)
- `delay` (optional): number (ms between keystrokes, default: 0)

**Usage Example:**
```typescript
await dispatchAction('TYPE_TEXT', {
  text: 'Hello World!',
  delay: 50
}, tabId);
```

---

### CLEAR
Clear the value of an input or textarea element.

**Usage Example:**
```typescript
await dispatchAction('CLEAR', {
  selectorOrRef: 'input#search'
}, tabId);
```

---

### PRESS_KEY
Press a single keyboard key or key combination.

**Parameters:**
- `key`: string (Key name: 'Enter', 'Escape', 'ArrowDown', 'a', 'b', etc.)
- `modifiers` (optional): number (Keyboard modifiers: 1=Alt, 2=Ctrl, 4=Meta, 8=Shift)

**Usage Example:**
```typescript
// Press Enter
await dispatchAction('PRESS_KEY', { key: 'Enter' }, tabId);

// Press Ctrl+S
await dispatchAction('PRESS_KEY', { 
  key: 's', 
  modifiers: 2 // Ctrl
}, tabId);
```

---

### FOCUS
Focus on an element.

**Usage Example:**
```typescript
await dispatchAction('FOCUS', {
  selectorOrRef: 'input#username'
}, tabId);
```

---

### CHECK
Check a checkbox element.

**Usage Example:**
```typescript
await dispatchAction('CHECK', {
  selectorOrRef: 'input#newsletter'
}, tabId);
```

---

### UNCHECK
Uncheck a checkbox element.

**Usage Example:**
```typescript
await dispatchAction('UNCHECK', {
  selectorOrRef: 'input#notifications'
}, tabId);
```

---

### SELECT_OPTION
Select an option from a dropdown select element.

**Parameters:**
- `value` (optional): string (Select by option value)
- `label` (optional): string (Select by option visible text)
- `index` (optional): number (Select by option index)

**Usage Example:**
```typescript
// Select by value
await dispatchAction('SELECT_OPTION', {
  selectorOrRef: 'select#country',
  value: 'us'
}, tabId);

// Select by label
await dispatchAction('SELECT_OPTION', {
  selectorOrRef: 'select#country',
  label: 'United States'
}, tabId);
```

---

### SELECT_ALL
Select all text in an input or textarea element.

**Usage Example:**
```typescript
await dispatchAction('SELECT_ALL', {
  selectorOrRef: 'textarea#description'
}, tabId);
```

---

### SCROLL
Scroll an element or the page by a specified amount.

**Parameters:**
- `deltaX` (optional): number (Pixels to scroll horizontally)
- `deltaY` (optional): number (Pixels to scroll vertically)

**Usage Example:**
```typescript
// Scroll page down by 500px
await dispatchAction('SCROLL', {
  deltaY: 500
}, tabId);

// Scroll element horizontally
await dispatchAction('SCROLL', {
  selectorOrRef: '.horizontal-scroll',
  deltaX: 200
}, tabId);
```

---

### SCROLL_INTO_VIEW
Scroll an element into the viewport.

**Parameters:**
- `align` (optional): 'start' | 'center' | 'end' | 'nearest' (default: 'start')

**Usage Example:**
```typescript
await dispatchAction('SCROLL_INTO_VIEW', {
  selectorOrRef: '.footer-section',
  align: 'end'
}, tabId);
```

---

### DISPATCH_EVENT
Dispatch a custom DOM event on an element.

**Parameters:**
- `eventType`: string (Event type: 'click', 'input', 'submit', etc.)
- `eventInit` (optional): object (Event initialization properties)

**Usage Example:**
```typescript
await dispatchAction('DISPATCH_EVENT', {
  selectorOrRef: 'form#login',
  eventType: 'submit'
}, tabId);
```

---

### SET_ELEMENT_VALUE
Directly set the value property of an element (bypasses user interaction simulation).

**Parameters:**
- `value`: string (Value to set)

**Usage Example:**
```typescript
await dispatchAction('SET_ELEMENT_VALUE', {
  selectorOrRef: 'input#hidden-field',
  value: 'secret-value'
}, tabId);
```

---

### TAP_TOUCH
Perform a touch tap on an element (for mobile emulation).

**Parameters:**
- `duration` (optional): number (ms of touch duration, default: 100)

**Usage Example:**
```typescript
await dispatchAction('TAP_TOUCH', {
  selectorOrRef: '.mobile-button'
}, tabId);
```

---

### HIGHLIGHT
Visually highlight an element on the page (for debugging).

**Parameters:**
- `color` (optional): string (Highlight color, default: 'rgba(255, 0, 0, 0.3)')
- `duration` (optional): number (ms to keep highlight, default: 2000)

**Usage Example:**
```typescript
await dispatchAction('HIGHLIGHT', {
  selectorOrRef: '.target-element',
  color: 'rgba(0, 255, 0, 0.5)',
  duration: 3000
}, tabId);
```

## Best Practices

1. Always prefer `FILL` over `TYPE_TEXT` for form inputs unless you need to simulate actual typing
2. Use appropriate delays between interactions to match human behavior and avoid triggering anti-bot systems
3. Verify element state (enabled, visible) before attempting interactions
4. Use `SCROLL_INTO_VIEW` before interacting with elements that may be outside the viewport
5. For complex forms, validate input values after filling to ensure they were entered correctly
