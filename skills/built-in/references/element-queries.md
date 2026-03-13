# Element Query & Read Operations

This document covers actions for reading and extracting information from DOM elements.

## Why Use Refs for Element Queries?

**Efficient Context Usage:**
- **CSS Selectors**: ~3000-5000 tokens for full DOM + selector resolution
- **Refs**: ~200-400 tokens with direct element access

**Stability:**
- CSS selectors break when classes change (e.g., `.button__primary--large` → `.button__primary--small`)
- Refs remain stable across page updates

**Performance:**
- CSS selectors require DOM traversal on every query
- Refs use direct object references

**Example:**
```
CSS Selector: div.container > div.card:nth-child(3) > button.primary
Ref:           @e12
```

## Common Parameters

All element query actions accept these common parameters:
- `selectorOrRef`: string (**PREFERRED**: Element reference from snapshot, e.g., `@e1`, `@e12`. **Fallback**: CSS selector)
- `timeout`: number (optional, default: 5000ms - Maximum time to wait for element to exist)

## How to Use Element Queries with Refs

### Step 1: Get Snapshot to Obtain Refs
```typescript
const snapshot = await dispatchAction('GET_SNAPSHOT', {}, tabId);
// Snapshot returns:
// @e1 [header]
//   @e2 [h1] "Welcome"
//   @e3 [button] "Login"
```

### Step 2: Use Refs for Element Queries
```typescript
// Query using refs (PREFERRED)
const title = await dispatchAction('GET_ELEMENT_TEXT', {
  selectorOrRef: '@e2'  // Direct ref
}, tabId);

const isButtonVisible = await dispatchAction('IS_ELEMENT_VISIBLE', {
  selectorOrRef: '@e3'  // Direct ref
}, tabId);
```

### Step 3: Re-Snapshot After Page Changes
```typescript
// After page change, old refs are invalid
await dispatchAction('CLICK', { selectorOrRef: '@e3' }, tabId);

// MUST re-snapshot to get new refs
const newSnapshot = await dispatchAction('GET_SNAPSHOT', {}, tabId);
```

## Action Reference

---

### GET_ELEMENT_TEXT
Get the visible text content of an element.

**Returns:**
string - Trimmed text content of the element.

**Usage Example:**
```typescript
const headerText = await dispatchAction('GET_ELEMENT_TEXT', {
  selectorOrRef: 'h1.page-title'
}, tabId);
```

---

### GET_ELEMENT_ATTRIBUTE
Get the value of a specific attribute on an element.

**Parameters:**
- `attribute`: string (Name of the attribute to retrieve)

**Returns:**
string | null - Attribute value or null if attribute doesn't exist.

**Usage Example:**
```typescript
const linkHref = await dispatchAction('GET_ELEMENT_ATTRIBUTE', {
  selectorOrRef: 'a#home-link',
  attribute: 'href'
}, tabId);
```

---

### IS_ELEMENT_VISIBLE
Check if an element is visible on the page.

**Returns:**
boolean - True if element is visible, false otherwise.

**Usage Example:**
```typescript
const isModalVisible = await dispatchAction('IS_ELEMENT_VISIBLE', {
  selectorOrRef: '.modal-container'
}, tabId);
```

---

### IS_ELEMENT_ENABLED
Check if a form element is enabled.

**Returns:**
boolean - True if element is enabled, false if disabled.

**Usage Example:**
```typescript
const isButtonEnabled = await dispatchAction('IS_ELEMENT_ENABLED', {
  selectorOrRef: 'button#submit'
}, tabId);
```

---

### IS_ELEMENT_CHECKED
Check if a checkbox or radio input is checked.

**Returns:**
boolean - True if element is checked, false otherwise.

**Usage Example:**
```typescript
const isTosAccepted = await dispatchAction('IS_ELEMENT_CHECKED', {
  selectorOrRef: 'input#terms-of-service'
}, tabId);
```

---

### GET_ELEMENT_INNER_TEXT
Get the full innerText of an element (includes hidden text).

**Returns:**
string - Full innerText content.

**Usage Example:**
```typescript
const fullText = await dispatchAction('GET_ELEMENT_INNER_TEXT', {
  selectorOrRef: '.article-content'
}, tabId);
```

---

### GET_ELEMENT_INNER_HTML
Get the innerHTML content of an element.

**Returns:**
string - HTML string of the element's contents.

**Usage Example:**
```typescript
const contentHtml = await dispatchAction('GET_ELEMENT_INNER_HTML', {
  selectorOrRef: '.rich-text-editor'
}, tabId);
```

---

### GET_ELEMENT_INPUT_VALUE
Get the current value of an input, textarea, or select element.

**Returns:**
string - Current value of the form element.

**Usage Example:**
```typescript
const emailValue = await dispatchAction('GET_ELEMENT_INPUT_VALUE', {
  selectorOrRef: 'input#email'
}, tabId);
```

---

### GET_ELEMENT_BOUNDING_BOX
Get the position and dimensions of an element.

**Returns:**
object - { x: number, y: number, width: number, height: number, top: number, right: number, bottom: number, left: number }

**Usage Example:**
```typescript
const bbox = await dispatchAction('GET_ELEMENT_BOUNDING_BOX', {
  selectorOrRef: '.draggable-element'
}, tabId);
```

---

### GET_ELEMENT_COUNT
Count the number of elements matching a selector.

**Parameters:**
- `selector`: string (CSS selector to count)

**Returns:**
number - Number of matching elements.

**Usage Example:**
```typescript
const itemCount = await dispatchAction('GET_ELEMENT_COUNT', {
  selector: '.list-item'
}, tabId);
```

---

### GET_ELEMENT_STYLES
Get computed styles of an element.

**Parameters:**
- `properties` (optional): string[] - Specific CSS properties to retrieve (returns all if not specified)

**Returns:**
object - Key-value pairs of CSS property names and values.

**Usage Example:**
```typescript
const styles = await dispatchAction('GET_ELEMENT_STYLES', {
  selectorOrRef: '.header',
  properties: ['backgroundColor', 'fontSize', 'padding']
}, tabId);
```

---

### RESOLVE_ELEMENT_CENTER
Calculate the center coordinates of an element.

**Returns:**
object - { x: number, y: number } - Center point relative to viewport.

**Usage Example:**
```typescript
const center = await dispatchAction('RESOLVE_ELEMENT_CENTER', {
  selectorOrRef: '.target-element'
}, tabId);
```

---

### RESOLVE_ELEMENT_OBJECT_ID
Get the Chrome DevTools Protocol object ID for an element.

**Returns:**
string - CDP object ID for advanced DOM interactions.

**Usage Example:**
```typescript
const objectId = await dispatchAction('RESOLVE_ELEMENT_OBJECT_ID', {
  selectorOrRef: '.complex-element'
}, tabId);
```

## Best Practices

### 1. Always Prefer Refs Over CSS Selectors
```typescript
// ✅ PREFERRED: Use refs from snapshot
const snapshot = await dispatchAction('GET_SNAPSHOT', {}, tabId);
// Snapshot contains: @e1 [button] "Submit"
const isVisible = await dispatchAction('IS_ELEMENT_VISIBLE', {
  selectorOrRef: '@e1'
}, tabId);

// ❌ AVOID: Brittle CSS selectors
await dispatchAction('IS_ELEMENT_VISIBLE', {
  selectorOrRef: 'div.container > div.card:nth-child(3) > button.primary'
}, tabId);
```

### 2. Re-Snapshot After Page Changes
```typescript
// Get initial snapshot with refs
const snapshot1 = await dispatchAction('GET_SNAPSHOT', {}, tabId);
// Contains: @e1 [button] "Next"

// Use ref for query
const text1 = await dispatchAction('GET_ELEMENT_TEXT', { selectorOrRef: '@e1' }, tabId);

// Click button - page changes, refs become invalid!
await dispatchAction('CLICK', { selectorOrRef: '@e1' }, tabId);

// MUST re-snapshot to get new refs
const snapshot2 = await dispatchAction('GET_SNAPSHOT', {}, tabId);
// Contains: @e1 [h1] "Page 2" - Different element now!
```

### 3. Store Frequently Used Refs for Multiple Queries
```typescript
// Get snapshot and extract refs for frequently used elements
const snapshot = await dispatchAction('GET_SNAPSHOT', {}, tabId);
// Contains: @e5 [button] "Submit", @e12 [input] "Email"

// Store refs for repeated use
const refs = {
  submitButton: '@e5',
  emailInput: '@e12'
};

// Use stored refs for multiple queries
const isButtonEnabled = await dispatchAction('IS_ELEMENT_ENABLED', {
  selectorOrRef: refs.submitButton
}, tabId);

const emailValue = await dispatchAction('GET_ELEMENT_INPUT_VALUE', {
  selectorOrRef: refs.emailInput
}, tabId);

// Continue using refs for subsequent queries without re-snapshotting
const isEmailValid = await dispatchAction('GET_ELEMENT_ATTRIBUTE', {
  selectorOrRef: refs.emailInput,
  attribute: 'aria-invalid'
}, tabId);
```

### 4. Use Appropriate Timeouts for Async Loading
```typescript
// Elements that load asynchronously may need longer timeouts
const elementText = await dispatchAction('GET_ELEMENT_TEXT', {
  selectorOrRef: '@e8',  // Loaded via AJAX
  timeout: 10000        // Wait up to 10 seconds
}, tabId);
```

### 5. Validate Query Results
```typescript
// Always check results before using in subsequent actions
const isVisible = await dispatchAction('IS_ELEMENT_VISIBLE', {
  selectorOrRef: '@e3'
}, tabId);

if (isVisible) {
  // Safe to interact with the element
  await dispatchAction('CLICK', { selectorOrRef: '@e3' }, tabId);
} else {
  // Element not visible, handle gracefully
  console.log('Element @e3 is not visible, skipping interaction');
}
```

## Troubleshooting

### "Ref not found" Error
```typescript
// Ref may have changed - re-snapshot to get fresh refs
const snapshot = await dispatchAction('GET_SNAPSHOT', {}, tabId);
```

### Element Not Visible in Snapshot
```typescript
// Scroll down to reveal element
await dispatchAction('SCROLL', { deltaY: 1000 }, tabId);
const snapshot = await dispatchAction('GET_SNAPSHOT', {}, tabId);
```

### Too Many Elements in Snapshot
```typescript
// Use options to filter elements
const snapshot = await dispatchAction('GET_SNAPSHOT', {
  options: {
    fullPage: false,
    ignoreElements: ['.ads', '.sidebar', '.banner']
  }
}, tabId);
```
