# Storage Management

This document covers actions for managing browser storage (localStorage and sessionStorage).

---

## GET_STORAGE
Retrieve data from localStorage or sessionStorage.

**Parameters:**
- `storageArea`: 'localStorage' | 'sessionStorage' (Storage area to access)
- `key` (optional): string (Specific key to retrieve, returns all if not specified)

**Returns:**
Any - Value stored under the key, or object of all key-value pairs if no key specified.

**Usage Examples:**

**Get all localStorage items:**
```typescript
const allLocalStorage = await dispatchAction('GET_STORAGE', {
  storageArea: 'localStorage'
}, tabId);
```

**Get specific item from sessionStorage:**
```typescript
const userSession = await dispatchAction('GET_STORAGE', {
  storageArea: 'sessionStorage',
  key: 'user_data'
}, tabId);
```

---

## SET_STORAGE
Store data in localStorage or sessionStorage.

**Parameters:**
- `storageArea`: 'localStorage' | 'sessionStorage' (Storage area to use)
- `key`: string (Key to store the value under)
- `value`: any (Value to store - will be JSON serialized)

**Usage Examples:**

**Store object in localStorage:**
```typescript
await dispatchAction('SET_STORAGE', {
  storageArea: 'localStorage',
  key: 'user_preferences',
  value: {
    theme: 'dark',
    notifications: true,
    language: 'en'
  }
}, tabId);
```

**Store string in sessionStorage:**
```typescript
await dispatchAction('SET_STORAGE', {
  storageArea: 'sessionStorage',
  key: 'temp_token',
  value: 'abc123def456'
}, tabId);
```

---

## CLEAR_STORAGE
Clear data from localStorage or sessionStorage.

**Parameters:**
- `storageArea`: 'localStorage' | 'sessionStorage' (Storage area to clear)
- `key` (optional): string (Specific key to clear, clears all if not specified)

**Usage Examples:**

**Clear all localStorage:**
```typescript
await dispatchAction('CLEAR_STORAGE', {
  storageArea: 'localStorage'
}, tabId);
```

**Clear specific item from sessionStorage:**
```typescript
await dispatchAction('CLEAR_STORAGE', {
  storageArea: 'sessionStorage',
  key: 'temp_token'
}, tabId);
```

## Best Practices

1. **Data Persistence:**
   - Use `localStorage` for data that should persist across browser sessions
   - Use `sessionStorage` for temporary data that should be cleared when the tab closes
   - Don't store sensitive data (passwords, tokens) in localStorage - use HTTP-only cookies instead

2. **Data Types:**
   - Values are automatically JSON serialized/deserialized
   - Complex objects, arrays, numbers, and booleans are supported
   - Circular references in objects will cause serialization failures

3. **Storage Limits:**
   - Most browsers limit localStorage to 5-10MB per origin
   - Large datasets should be stored in IndexedDB instead
   - Always handle potential storage quota exceeded errors

4. **Security:**
   - Storage is accessible by JavaScript on the same origin, making it vulnerable to XSS attacks
   - Never store sensitive authentication tokens or personal information in storage
   - Clear sensitive data when users log out or sessions end

## Common Use Cases

- **User Preferences**: Store UI settings, theme preferences, and user configurations
- **Application State**: Persist non-sensitive application state across page reloads
- **Temporary Data**: Store form data temporarily during multi-step workflows
- **Cache**: Cache API responses or computed data to improve performance
- **Session Management**: Track temporary session state that doesn't need to persist across restarts

## Example Workflows

**Save and Restore Form State:**
```typescript
// Save form draft
async function saveFormDraft(formData: object) {
  await dispatchAction('SET_STORAGE', {
    storageArea: 'localStorage',
    key: 'form_draft',
    value: {
      data: formData,
      timestamp: Date.now()
    }
  }, tabId);
}

// Restore form draft
async function restoreFormDraft() {
  const draft = await dispatchAction('GET_STORAGE', {
    storageArea: 'localStorage',
    key: 'form_draft'
  }, tabId);
  
  if (draft && Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
    return draft.data;
  }
  
  // Clear expired draft
  await dispatchAction('CLEAR_STORAGE', {
    storageArea: 'localStorage',
    key: 'form_draft'
  }, tabId);
  
  return null;
}
```
