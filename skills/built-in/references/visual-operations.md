# Visual Operations

This document covers screenshot capture actions.

---

## TAKE_SCREENSHOT
Capture a screenshot of page, full page, or specific element.

**Command shape:**
- `action: 'TAKE_SCREENSHOT'`
- `options?: {`
  - `selector?: string` (supports CSS selector or `@eX` ref)
  - `path?: string`
  - `fullPage?: boolean`
  - `format?: 'png' | 'jpeg'`
  - `quality?: number` (jpeg only)
- `}`

**Returns:**
- `{ path: string, data: string, dataUrl: string }`
- `data` is base64 image data.

**Usage Examples:**

**Full Page Screenshot:**
```typescript
const fullPageScreenshot = await dispatchAction('TAKE_SCREENSHOT', {
  options: {
    fullPage: true,
    format: 'png',
  },
}, tabId);
```

**Element Screenshot:**
```typescript
const componentScreenshot = await dispatchAction('TAKE_SCREENSHOT', {
  options: {
    selector: '@e12',
    format: 'jpeg',
    quality: 90,
  },
}, tabId);
```

## Best Practices

1. **Use Supported Format:**
   - PNG for lossless text/UI
   - JPEG for smaller files

2. **Evidence Capture:**
   - Always capture full page screenshots for bug reports or audit trails
   - Include timestamps or unique identifiers in filenames when saving screenshots
   - Capture element-specific screenshots when verifying component-level functionality

3. **Performance:**
   - Full page screenshots can be large and slow on long pages
   - Use element clips or specific element screenshots when only a portion of the page is needed

4. **Storage:**
   ```typescript
   // Example: Save screenshot to file
   import fs from 'fs/promises';
   import { Buffer } from 'node:buffer';

   const screenshot = await dispatchAction('TAKE_SCREENSHOT', {
     options: { fullPage: true }
   }, tabId);
   const buffer = Buffer.from(screenshot.data, 'base64');
   await fs.writeFile('screenshot.png', buffer);
   ```

## Common Use Cases

- **Regression Testing**: Capture screenshots to compare visual changes between versions
- **Bug Reporting**: Provide visual evidence of issues
- **Audit Trails**: Document the state of the page at key workflow points
- **Content Extraction**: Capture visual content that cannot be easily extracted through DOM methods
- **Demo Recording**: Create step-by-step visual documentation of workflows
