# Element Query & Read Operations

This document covers read/query actions against elements and refs.

## Common Input

- `selectorOrRef`: string (CSS selector or ref like `@e7`)

## Action Matrix

### RESOLVE_ELEMENT_CENTER
Returns viewport center point.

```typescript
const point = await dispatchAction('RESOLVE_ELEMENT_CENTER', { selectorOrRef: '@e1' }, tabId)
// { x, y }
```

### RESOLVE_ELEMENT_OBJECT_ID
Returns CDP object id.

```typescript
const objectId = await dispatchAction('RESOLVE_ELEMENT_OBJECT_ID', { selectorOrRef: '@e1' }, tabId)
```

### GET_ELEMENT_TEXT
Returns `innerText || textContent || ''`.

### GET_ELEMENT_ATTRIBUTE
Input:
- `attribute`: string

Returns attribute value (unknown, usually `string | null`).

### IS_ELEMENT_VISIBLE
Returns `boolean`.

### IS_ELEMENT_ENABLED
Returns `boolean`.

### IS_ELEMENT_CHECKED
Returns `boolean`.

### GET_ELEMENT_INNER_TEXT
Returns `string`.

### GET_ELEMENT_INNER_HTML
Returns `string`.

### GET_ELEMENT_INPUT_VALUE
Returns `string`.

### SET_ELEMENT_VALUE
Input:
- `value`: string

Sets value and dispatches `input` + `change`.

### GET_ELEMENT_BOUNDING_BOX
Returns `{ x, y, width, height }`.

### GET_ELEMENT_COUNT
Input:
- `selector`: string

Returns `number`.

### GET_ELEMENT_STYLES
Optional input:
- `properties?: string[]`

Returns style object for requested/all computed properties.

## Example

```typescript
const visible = await dispatchAction('IS_ELEMENT_VISIBLE', { selectorOrRef: '@e2' }, tabId)
if (visible) {
  const text = await dispatchAction('GET_ELEMENT_TEXT', { selectorOrRef: '@e2' }, tabId)
  console.log(text)
}
```

## Best Practices

- Run `GET_SNAPSHOT` before querying refs.
- Re-snapshot after navigation/dynamic DOM updates.
- Prefer refs for stability; use CSS selectors only when necessary.
