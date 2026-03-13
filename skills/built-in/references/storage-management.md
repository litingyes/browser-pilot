# Storage Management

This document covers storage actions backed by page-side `localStorage` / `sessionStorage`.

---

## GET_STORAGE
Retrieve value(s) from storage.

**Parameters:**
- `storageType?`: `'local' | 'session'` (default: `'local'`)
- `key?`: string

**Returns:**
- If `key` provided: `{ key: string, value: unknown }`
- Otherwise: `{ data: Record<string, string | null> }`

**Usage Examples:**

**Get all localStorage items:**
```typescript
const allLocalStorage = await dispatchAction('GET_STORAGE', {
  storageType: 'local'
}, tabId);
```

**Get specific item from sessionStorage:**
```typescript
const userSession = await dispatchAction('GET_STORAGE', {
  storageType: 'session',
  key: 'user_data'
}, tabId);
```

---

## SET_STORAGE
Set one storage key.

**Parameters:**
- `key`: string
- `value`: string
- `storageType?`: `'local' | 'session'` (default: `'local'`)

**Usage Examples:**

**Store object in localStorage:**
```typescript
await dispatchAction('SET_STORAGE', {
  storageType: 'local',
  key: 'theme',
  value: 'dark',
}, tabId)
```

**Store string in sessionStorage:**
```typescript
await dispatchAction('SET_STORAGE', {
  storageType: 'session',
  key: 'temp_token',
  value: 'abc123def456',
}, tabId)
```

---

## CLEAR_STORAGE
Clear storage area.

**Parameters:**
- `storageType?`: `'local' | 'session'` (default: `'local'`)

**Usage Examples:**

**Clear all localStorage:**
```typescript
await dispatchAction('CLEAR_STORAGE', {
  storageType: 'local'
}, tabId);
```

## Best Practices

1. **Data Persistence:**
   - Use `storageType: 'local'` for cross-session persistence
   - Use `storageType: 'session'` for tab-scoped temporary values
   - Don't store sensitive data (passwords, tokens) in localStorage - use HTTP-only cookies instead

2. **Data Types:**
   - Values are stored as strings
   - Serialize/deserialize structured objects yourself (`JSON.stringify` / `JSON.parse`)

3. **Storage Limits:**
   - Most browsers limit localStorage to 5-10MB per origin
   - Large datasets should be stored in IndexedDB instead
   - Always handle potential storage quota exceeded errors

4. **Security:**
   - Storage is accessible by JavaScript on the same origin, making it vulnerable to XSS attacks
   - Never store sensitive authentication tokens or personal information in storage
   - Clear sensitive data when users log out or sessions end

## Typical Pattern

```typescript
const payload = JSON.stringify({ step: 2, status: 'ok' })
await dispatchAction('SET_STORAGE', { storageType: 'session', key: 'workflow', value: payload }, tabId)

const stored = await dispatchAction('GET_STORAGE', { storageType: 'session', key: 'workflow' }, tabId)
const parsed = typeof stored.value === 'string' ? JSON.parse(stored.value) : null
```
