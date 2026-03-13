# Snapshot & Reference Management

This document covers actions for capturing page state and managing element references.

## Why Use Refs Instead of CSS Selectors?

**Traditional approach (CSS selectors):**
- Requires parsing full DOM/HTML (~3000-5000 tokens)
- CSS selectors can break when page structure changes
- Brittle class names like `.button__primary--large` are auto-generated
- XPath selectors are verbose and hard to maintain

**Refs approach (RECOMMENDED):**
- Compact snapshot (~200-400 tokens)
- Stable refs like `@e1`, `@e2`, `@e3` 
- Direct element interaction without selector resolution
- Resilient to minor page changes

**Example comparison:**
```
CSS Selector:  div.container > div.card:nth-child(3) > button.primary
Ref:           @e12
```

## Actions

### GET_SNAPSHOT
Capture full page snapshot with element references for follow-up actions.

**Parameters:**
- `options` (optional): Snapshot configuration
  - `includeIframes`: boolean (default: false)
  - `fullPage`: boolean (default: false)
  - `ignoreElements`: string[] (CSS selectors to exclude)

**Returns:**
Page structure with element refs, text content, and DOM hierarchy.

**Snapshot Output Format:**
```
Page: Example Site - Home
URL: https://example.com

@e1 [header]
  @e2 [nav]
    @e3 [a] "Home"
    @e4 [a] "Products"
    @e5 [a] "About"
  @e6 [button] "Sign In"

@e7 [main]
  @e8 [h1] "Welcome"
  @e9 [form]
    @e10 [input type="email"] placeholder="Email"
    @e11 [input type="password"] placeholder="Password"
    @e12 [button type="submit"] "Log In"
```

**Usage Example:**
```typescript
const snapshot = await dispatchAction('GET_SNAPSHOT', {
  options: { fullPage: true }
}, tabId);
```

---

### PARSE_REF
Parse a reference string for diagnostics and validation.

**Parameters:**
- `ref`: string (Element reference string from snapshot)

**Returns:**
Parsed reference components including element path, attributes, and metadata.

**Usage Example:**
```typescript
const refInfo = await dispatchAction('PARSE_REF', {
  ref: 'ref-123-abc'
}, tabId);
```

---

### ENSURE_TAB_STATE
Verify and retrieve current tab scoped runtime state.

**Parameters:**
- `keys` (optional): string[] (Specific state keys to retrieve)

**Returns:**
Current tab state object.

**Usage Example:**
```typescript
const state = await dispatchAction('ENSURE_TAB_STATE', {
  keys: ['userSession', 'formData']
}, tabId);
```

---

### UPDATE_TAB_STATE
Update tab scoped runtime state with new values.

**Parameters:**
- `state`: object (Key-value pairs to update in tab state)

**Returns:**
Updated state object.

**Usage Example:**
```typescript
await dispatchAction('UPDATE_TAB_STATE', {
  state: {
    userSession: 'active',
    lastAction: 'login'
  }
}, tabId);
```

## Ref Lifecycle & Best Practices

### Ref Lifecycle

**CRITICAL**: Refs are invalidated when the page changes!

```typescript
// 1. Get initial snapshot
const snapshot = await dispatchAction('GET_SNAPSHOT', {}, tabId);
// Returns: @e1 [button] "Next"

// 2. Use the ref for interaction
await dispatchAction('CLICK', { selectorOrRef: '@e1' }, tabId);

// 3. Page changed after click - ref is now INVALID!

// 4. MUST re-snapshot to get new refs!
const newSnapshot = await dispatchAction('GET_SNAPSHOT', {}, tabId);
// Returns: @e1 [h1] "Page 2"  ← Different element now!
```

### Best Practices

#### 1. Always Snapshot Before Interacting

```typescript
// CORRECT - Snapshot first, then use refs
const snapshot = await dispatchAction('GET_SNAPSHOT', {}, tabId);
await dispatchAction('CLICK', { selectorOrRef: '@e1' }, tabId);

// WRONG - Ref doesn't exist yet!
await dispatchAction('CLICK', { selectorOrRef: '@e1' }, tabId);
```

#### 2. Re-Snapshot After Navigation

```typescript
// After navigation, old refs are invalid
await dispatchAction('CLICK', { selectorOrRef: '@e5' }, tabId); // Navigates to new page

// Must re-snapshot for new refs
const newSnapshot = await dispatchAction('GET_SNAPSHOT', {}, tabId);
await dispatchAction('CLICK', { selectorOrRef: '@e1' }, tabId);
```

#### 3. Re-Snapshot After Dynamic Changes

```typescript
// After dynamic content changes
await dispatchAction('CLICK', { selectorOrRef: '@e1' }, tabId); // Opens dropdown

// Must re-snapshot to see dropdown items
const updatedSnapshot = await dispatchAction('GET_SNAPSHOT', {}, tabId);
await dispatchAction('CLICK', { selectorOrRef: '@e7' }, tabId); // Select dropdown item
```

#### 4. Store Frequently Used Refs

```typescript
// Store refs for elements used multiple times
const snapshot = await dispatchAction('GET_SNAPSHOT', {}, tabId);
const refs = {
  submitButton: '@e5',
  searchInput: '@e12',
  userMenu: '@e3'
};

// Use stored refs for multiple operations
await dispatchAction('FILL', { selectorOrRef: refs.searchInput, value: 'query' }, tabId);
await dispatchAction('CLICK', { selectorOrRef: refs.submitButton }, tabId);
```

#### 5. Prefer Refs Over CSS Selectors

```typescript
// PREFERRED - Use refs from snapshot
const snapshot = await dispatchAction('GET_SNAPSHOT', {}, tabId);
await dispatchAction('CLICK', { selectorOrRef: '@e1' }, tabId);

// AVOID - Brittle CSS selectors
await dispatchAction('CLICK', { 
  selectorOrRef: 'div.container > div.card:nth-child(3) > button.primary' 
}, tabId);
```

## Troubleshooting

### "Ref not found" or "Invalid ref" Error

```typescript
// Ref may have changed - re-snapshot
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
