# Debugger & CDP Operations

This document covers actions for working with the Chrome DevTools Protocol (CDP) and debugger.

For standard navigation and tab control, prefer high-level actions (`NAVIGATE`, `TAB_LIST`, `TAB_NEW`, `TAB_SWITCH`, `TAB_CLOSE`) instead of `SEND_CDP`.

---

## ATTACH_DEBUGGER
Attach the CDP debugger to the current tab.

**Returns:**
boolean - True if debugger was successfully attached.

**Usage Example:**
```typescript
const attached = await dispatchAction('ATTACH_DEBUGGER', {}, tabId);
if (attached) {
  console.log('Debugger attached successfully');
}
```

---

## SEND_CDP
Send a raw CDP command to the browser.

**IMPORTANT**: This is a low-level high-risk operation. Only use when standard actions cannot solve your task.

**Parameters:**
- `method`: string (CDP method name, e.g., 'Page.navigate', 'Runtime.evaluate')
- `params` (optional): object (Method parameters)

**Returns:**
object - CDP command response.

**Usage Examples:**

**Evaluate JavaScript in page context:**
```typescript
const result = await dispatchAction('SEND_CDP', {
  method: 'Runtime.evaluate',
  params: {
    expression: 'document.title',
    returnByValue: true
  }
}, tabId);

console.log('Page title:', result.result.value);
```

**Navigate to URL with CDP (fallback only):**
```typescript
await dispatchAction('SEND_CDP', {
  method: 'Page.navigate',
  params: {
    url: 'https://example.com'
  }
}, tabId);
```

**Get performance metrics:**
```typescript
const metrics = await dispatchAction('SEND_CDP', {
  method: 'Performance.getMetrics'
}, tabId);
```

**Set network conditions:**
```typescript
await dispatchAction('SEND_CDP', {
  method: 'Network.emulateNetworkConditions',
  params: {
    offline: false,
    latency: 200, // ms
    downloadThroughput: 1000000, // bytes/s (1Mbps)
    uploadThroughput: 500000 // bytes/s (500kbps)
  }
}, tabId);
```

## CDP Domain Reference

Commonly used CDP domains:

| Domain | Description |
|--------|-------------|
| `Page` | Page navigation, screenshot, lifecycle events |
| `Runtime` | JavaScript evaluation, console interaction |
| `DOM` | DOM inspection and manipulation |
| `Network` | Network monitoring, request/response interception |
| `Debugger` | JavaScript debugging, breakpoints |
| `Console` | Console message handling |
| `Performance` | Performance metrics and profiling |
| `Emulation` | Device emulation, geolocation, network conditions |
| `Storage` | Cookie and storage management |
| `Input` | Input event simulation |

## Best Practices

1. **Risk Mitigation:**
   - Only use `SEND_CDP` when higher-level actions don't support your use case
   - Test CDP commands in isolation before integrating into automation flows
   - Handle CDP errors gracefully as they can cause tab instability

2. **Debugger Management:**
   - Always attach the debugger before sending CDP commands
   - The debugger remains attached until the tab is closed or navigated
   - Some CDP commands require specific domain enabling (e.g., `Network.enable()`)

3. **JavaScript Evaluation:**
   - Use `returnByValue: true` for simple values to avoid object ID references
   - For complex operations, consider using `Runtime.evaluate` with `awaitPromise: true`
   - Be cautious with user-provided expressions to prevent code injection

4. **Performance:**
   - CDP commands have higher overhead than standard automation actions
   - Batch related operations where possible
   - Disable unused domains after use to reduce overhead

## Common CDP Recipes

### Intercept Network Requests
```typescript
// Enable network domain
await dispatchAction('SEND_CDP', {
  method: 'Network.enable'
}, tabId);

// Set request interception pattern
await dispatchAction('SEND_CDP', {
  method: 'Network.setRequestInterception',
  params: {
    patterns: [{ urlPattern: '*' }]
  }
}, tabId);

// Listen for requests (implement event handling as needed)
```

### Geolocation Emulation
```typescript
await dispatchAction('SEND_CDP', {
  method: 'Emulation.setGeolocationOverride',
  params: {
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 100
  }
}, tabId);
```

### Capture Full Page Screenshot with CDP
```typescript
const screenshot = await dispatchAction('SEND_CDP', {
  method: 'Page.captureScreenshot',
  params: {
    format: 'png',
    fullPage: true
  }
}, tabId);
```

### Get All Console Messages
```typescript
await dispatchAction('SEND_CDP', {
  method: 'Console.enable'
}, tabId);

// Console messages will be emitted as events
```

## Security Considerations

- CDP provides full access to browser internals and can execute arbitrary code
- Never use untrusted input in CDP command parameters
- Be cautious when evaluating JavaScript from untrusted sources
- CDP access can bypass browser security policies and same-origin restrictions

For complete CDP documentation, visit the [Chrome DevTools Protocol official documentation](https://chromedevtools.github.io/devtools-protocol/).
