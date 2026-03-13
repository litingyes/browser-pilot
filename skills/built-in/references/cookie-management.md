# Cookie Management

This document covers actions for managing browser cookies.

---

## GET_COOKIES
Retrieve cookies from the current page or browser.

**Parameters:**
- `url` (optional): string (Get cookies for specific URL, defaults to current page URL)
- `name` (optional): string (Get specific cookie by name)
- `domain` (optional): string (Filter cookies by domain)
- `path` (optional): string (Filter cookies by path)

**Returns:**
Array of cookie objects:
```typescript
interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number; // Unix timestamp in seconds
  size: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
  session: boolean;
}
```

**Usage Examples:**

**Get all cookies for current page:**
```typescript
const cookies = await dispatchAction('GET_COOKIES', {}, tabId);
```

**Get specific cookie by name:**
```typescript
const sessionCookie = await dispatchAction('GET_COOKIES', {
  name: 'session_id'
}, tabId);
```

**Get cookies for specific domain:**
```typescript
const domainCookies = await dispatchAction('GET_COOKIES', {
  domain: '.example.com'
}, tabId);
```

---

## SET_COOKIES
Set one or more cookies.

**Parameters:**
- `cookies`: Cookie | Cookie[] (Single cookie object or array of cookie objects)

**Cookie Object Properties:**
- `name`: string (Required - Cookie name)
- `value`: string (Required - Cookie value)
- `url` (optional): string (URL to associate the cookie with)
- `domain` (optional): string (Cookie domain)
- `path` (optional): string (Cookie path, default: '/')
- `expires` (optional): number (Unix timestamp in seconds, default: session cookie)
- `httpOnly` (optional): boolean (Default: false)
- `secure` (optional): boolean (Default: false)
- `sameSite` (optional): 'Strict' | 'Lax' | 'None' (Default: 'Lax')

**Usage Examples:**

**Set a single session cookie:**
```typescript
await dispatchAction('SET_COOKIES', {
  cookies: {
    name: 'user_preference',
    value: 'dark_mode',
    path: '/',
    secure: true,
    sameSite: 'Strict'
  }
}, tabId);
```

**Set multiple cookies with expiration:**
```typescript
const oneYearFromNow = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

await dispatchAction('SET_COOKIES', {
  cookies: [
    {
      name: 'auth_token',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      domain: '.example.com',
      path: '/',
      expires: oneYearFromNow,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax'
    },
    {
      name: 'remember_me',
      value: 'true',
      domain: '.example.com',
      path: '/',
      expires: oneYearFromNow,
      secure: true
    }
  ]
}, tabId);
```

---

## CLEAR_COOKIES
Clear cookies matching specified filters.

**Parameters:**
- `url` (optional): string (Clear cookies for specific URL)
- `name` (optional): string (Clear specific cookie by name)
- `domain` (optional): string (Clear cookies for specific domain)
- `path` (optional): string (Clear cookies for specific path)

**Usage Examples:**

**Clear all cookies for current page:**
```typescript
await dispatchAction('CLEAR_COOKIES', {}, tabId);
```

**Clear specific cookie:**
```typescript
await dispatchAction('CLEAR_COOKIES', {
  name: 'session_id'
}, tabId);
```

**Clear all cookies for a domain:**
```typescript
await dispatchAction('CLEAR_COOKIES', {
  domain: '.example.com'
}, tabId);
```

## Best Practices

1. **Security:**
   - Always set `secure: true` for cookies containing sensitive data on HTTPS sites
   - Use `httpOnly: true` for authentication cookies to prevent XSS attacks
   - Use appropriate `sameSite` policies to prevent CSRF attacks

2. **Session Management:**
   - Clear authentication cookies when logging out or ending sessions
   - Set appropriate expiration times for persistent cookies
   - Avoid storing sensitive data in cookies when possible

3. **Domain and Path:**
   - Be specific with domain and path values to avoid unintended cookie access
   - Use leading dots (`.example.com`) for cookies that should be accessible across subdomains

4. **Testing:**
   - Verify cookie values after setting them using `GET_COOKIES`
   - Test authentication flows to ensure cookies are properly set and cleared

## Common Use Cases

- **Authentication Flows**: Set session cookies after successful login
- **State Persistence**: Store user preferences and session state
- **Testing**: Simulate different user sessions by setting appropriate cookies
- **Data Migration**: Transfer cookies between different browser contexts
- **Security Testing**: Verify cookie security attributes are properly configured
