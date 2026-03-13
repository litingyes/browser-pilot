# Snapshot & Reference Management

This document describes the snapshot/ref actions implemented in `browser-use`.

## Actions

### GET_SNAPSHOT
Capture the accessibility-tree based snapshot for the current tab and refresh internal ref mappings.

**Parameters:** none

**Returns:** `string` (tree text, or `"(empty page)"`)

```typescript
const snapshot = await dispatchAction('GET_SNAPSHOT', {}, tabId)
```

### PARSE_REF
Parse a ref input format.

Accepted inputs:
- `e1`
- `@e1`
- `ref=e1`

**Parameters:**
- `input`: string

**Returns:** `string | null`

```typescript
const ref = await dispatchAction('PARSE_REF', { input: '@e12' }, tabId)
```

### ENSURE_TAB_STATE
Ensure tab state exists and return it.

**Parameters:** none

**Returns:** tab scoped state object (`attached`, `refs`, `recordingState`)

```typescript
const state = await dispatchAction('ENSURE_TAB_STATE', {}, tabId)
```

### UPDATE_TAB_STATE
Merge partial state into current tab state.

**Parameters:**
- `state`: object

**Returns:** void-like success response from dispatcher.

```typescript
await dispatchAction('UPDATE_TAB_STATE', {
  state: {
    refs: {
      e999: { role: 'button', name: 'Temp' },
    },
  },
}, tabId)
```

## Ref Usage Rules

- Always call `GET_SNAPSHOT` after navigation or major UI changes.
- Prefer `selectorOrRef: '@eX'` over brittle CSS selectors whenever possible.
- If a ref fails, re-run `GET_SNAPSHOT` before retrying element actions.
