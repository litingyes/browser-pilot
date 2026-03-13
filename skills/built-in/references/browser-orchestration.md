# Browser Orchestration

This document covers high-level browser actions for navigation, page info retrieval, tab lifecycle, and debugger connection health checks.

---

## NAVIGATE
Navigate the current tab to a URL and optionally wait for a lifecycle state.

**Parameters:**
- `url`: string (Required)
- `waitUntil` (optional): `'load' | 'domcontentloaded' | 'networkidle'` (default: `'load'`)

**Returns:**
- `{ url: string, title: string }`

**Usage Example:**
```typescript
const result = await dispatchAction('NAVIGATE', {
  url: 'https://example.com',
  waitUntil: 'networkidle',
}, tabId)
```

---

## GET_URL
Get current page URL.

**Returns:** `string`

```typescript
const url = await dispatchAction('GET_URL', {}, tabId)
```

---

## GET_TITLE
Get current page title.

**Returns:** `string`

```typescript
const title = await dispatchAction('GET_TITLE', {}, tabId)
```

---

## GET_CONTENT
Get current page HTML (`document.documentElement.outerHTML`).

**Returns:** `string`

```typescript
const html = await dispatchAction('GET_CONTENT', {}, tabId)
```

---

## TAB_LIST
List tabs in the current window context, with active state.

**Returns:**
- `Array<{ index: number, id: number, title: string, url: string, type: 'page', active: boolean }>`

```typescript
const tabs = await dispatchAction('TAB_LIST', {}, tabId)
```

---

## TAB_NEW
Create a new tab in the current window and switch to it.

**Parameters:**
- `url` (optional): string (default: `about:blank`)

**Returns:**
- `{ index: number, tabId: number, url: string }`

```typescript
const tab = await dispatchAction('TAB_NEW', { url: 'https://news.ycombinator.com' }, tabId)
```

---

## TAB_SWITCH
Switch to a tab by index (based on `TAB_LIST` ordering).

**Parameters:**
- `index`: number

**Returns:**
- `{ index: number, tabId: number, url: string, title: string }`

```typescript
await dispatchAction('TAB_SWITCH', { index: 0 }, tabId)
```

---

## TAB_CLOSE
Close a tab by index. If no index is provided, closes the active tab.

**Parameters:**
- `index` (optional): number

**Returns:**
- `{ closed: number, activeIndex: number }`

```typescript
await dispatchAction('TAB_CLOSE', { index: 1 }, tabId)
```

---

## IS_CONNECTION_ALIVE
Check whether debugger/CDP connectivity is still healthy for the tab.

**Returns:** `boolean`

```typescript
const ok = await dispatchAction('IS_CONNECTION_ALIVE', {}, tabId)
```

## Recommended Sequence

1. `TAB_LIST` to understand current window context.
2. `TAB_NEW` or `TAB_SWITCH` to select target tab.
3. `NAVIGATE` with an explicit `waitUntil`.
4. `GET_TITLE` / `GET_URL` for sanity checks.
5. Continue with `GET_SNAPSHOT` + element actions.

## Notes

- These orchestration actions are safer and easier to maintain than raw `SEND_CDP`.
- `TAB_*` operations are window-scoped in the extension runtime.
- If actions fail after long idle time, run `IS_CONNECTION_ALIVE` and retry.
