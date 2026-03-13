# Visual Operations

This document covers actions for capturing visual evidence and screenshots.

---

## TAKE_SCREENSHOT
Capture a screenshot of the current page or viewport.

**Parameters:**
- `format` (optional): 'png' | 'jpeg' | 'webp' (default: 'png')
- `quality` (optional): number (0-100, for jpeg/webp formats, default: 80)
- `fullPage` (optional): boolean (Capture full scrollable page, default: false)
- `selectorOrRef` (optional): string (Capture only the specified element)
- `clip` (optional): object (Crop screenshot to region: { x: number, y: number, width: number, height: number })
- `omitBackground` (optional): boolean (Make background transparent for PNG, default: false)

**Returns:**
string - Base64 encoded image data.

**Usage Examples:**

**Full Page Screenshot:**
```typescript
const fullPageScreenshot = await dispatchAction('TAKE_SCREENSHOT', {
  fullPage: true,
  format: 'png'
}, tabId);
```

**Element Screenshot:**
```typescript
const componentScreenshot = await dispatchAction('TAKE_SCREENSHOT', {
  selectorOrRef: '.dashboard-card',
  format: 'jpeg',
  quality: 90
}, tabId);
```

**Viewport Screenshot with Custom Clip:**
```typescript
const croppedScreenshot = await dispatchAction('TAKE_SCREENSHOT', {
  clip: {
    x: 100,
    y: 200,
    width: 800,
    height: 600
  },
  format: 'webp'
}, tabId);
```

## Best Practices

1. **Use Appropriate Format:**
   - Use PNG for screenshots requiring transparency or sharp text
   - Use JPEG for large screenshots where file size is a concern
   - Use WebP for optimal compression with good quality

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

   const screenshot = await dispatchAction('TAKE_SCREENSHOT', { fullPage: true }, tabId);
   const buffer = Buffer.from(screenshot, 'base64');
   await fs.writeFile('screenshot.png', buffer);
   ```

## Common Use Cases

- **Regression Testing**: Capture screenshots to compare visual changes between versions
- **Bug Reporting**: Provide visual evidence of issues
- **Audit Trails**: Document the state of the page at key workflow points
- **Content Extraction**: Capture visual content that cannot be easily extracted through DOM methods
- **Demo Recording**: Create step-by-step visual documentation of workflows
