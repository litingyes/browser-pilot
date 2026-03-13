# Element Interaction Operations

This document covers interactive actions implemented in `browser-use`.

## Common Input

- `selectorOrRef`: string

## Action Matrix

### CLICK
Optional:
- `button?: 'left' | 'right' | 'middle'`
- `clickCount?: number`

### DBLCLICK
Double click helper.

### HOVER
Move pointer to element center.

### FILL
Input:
- `value: string`

Focus + clear + insert text.

### TYPE_TEXT
Input:
- `text: string`
- `clear?: boolean`
- `delayMs?: number`

### PRESS_KEY
Input:
- `key: string`

### SCROLL
Input:
- `options: { selectorOrRef?: string; deltaX: number; deltaY: number }`

### SELECT_OPTION
Input:
- `values: string[]` (matched against option `value` or visible text)

### CHECK / UNCHECK
Toggle checkbox/radio by current checked state.

### FOCUS
Focus element.

### CLEAR
Clear value and dispatch `input` + `change`.

### SELECT_ALL
Select all content in input/editable node.

### SCROLL_INTO_VIEW
Scroll element to center.

### DISPATCH_EVENT
Input:
- `eventType: string`
- `eventInit?: object`

### HIGHLIGHT
Temporary red outline highlight.

### TAP_TOUCH
Dispatch touch start/end at element center.

## Example

```typescript
await dispatchAction('FILL', { selectorOrRef: '@e8', value: 'user@example.com' }, tabId)
await dispatchAction('PRESS_KEY', { key: 'Enter' }, tabId)
```

## Notes

- This layer is CDP-based and does not expose Playwright-only options like `force`, `timeout`, `align`, or modifier bitmasks.
- Re-run `GET_SNAPSHOT` after actions that change page structure before reusing refs.
