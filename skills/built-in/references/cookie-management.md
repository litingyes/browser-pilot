# Cookie Management

This document covers cookie actions exposed by `browser-use`.

---

## GET_COOKIES
Retrieve cookies via CDP `Network.getCookies`.

**Parameters:**
- `urls?`: `string[]`

**Returns:**
Array of cookie objects.

```typescript
const cookies = await dispatchAction('GET_COOKIES', {
  urls: ['https://example.com'],
}, tabId)
```

---

## SET_COOKIES
Set one or more cookies via CDP `Network.setCookies`.

**Parameters:**
- `cookies`: `Record<string, unknown>[]`
- `currentUrl?`: string (used as fallback `url` when cookie item has neither `url` nor `domain`)

**Usage Example:**
```typescript
await dispatchAction('SET_COOKIES', {
  currentUrl: 'https://example.com',
  cookies: [
    { name: 'session_id', value: 'abc', path: '/', secure: true },
  ],
}, tabId)
```

---

## CLEAR_COOKIES
Clear browser cookies via CDP `Network.clearBrowserCookies`.

**Parameters:** none

**Usage Examples:**
```typescript
await dispatchAction('CLEAR_COOKIES', {}, tabId)
```

## Best Practices

1. **Security:**
   - Always set `secure: true` for cookies containing sensitive data on HTTPS sites
   - Use `httpOnly: true` for authentication cookies to prevent XSS attacks
   - Use appropriate `sameSite` policies to prevent CSRF attacks

2. **Testing:**
   - Verify cookie values after setting them using `GET_COOKIES`
   - Test login/logout flows to ensure cookies are properly set and cleared
