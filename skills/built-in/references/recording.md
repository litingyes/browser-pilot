# Session Recording Operations

This document covers actions for recording and replaying browser interaction sessions.

---

## RECORDING_START
Start recording a browser interaction session.

**Parameters:**
- `options` (optional): Recording configuration
  - `frameInterval`: number (ms between frames, default: 1000)
  - `includeSnapshots`: boolean (Include full DOM snapshots, default: true)
  - `includeScreenshots`: boolean (Include screenshots, default: false)
  - `screenshotQuality`: number (0-100, default: 70)
  - `maxFrames`: number (Maximum number of frames to capture, default: 1000)

**Returns:**
string - Recording session ID.

**Usage Example:**
```typescript
const recordingId = await dispatchAction('RECORDING_START', {
  options: {
    frameInterval: 500,
    includeScreenshots: true,
    screenshotQuality: 80
  }
}, tabId);
```

---

## RECORDING_ADD_FRAME
Manually add a frame to the current recording.

**Parameters:**
- `metadata` (optional): object - Custom metadata to attach to the frame
- `forceSnapshot`: boolean (default: false - Force capture even if interval not reached)

**Usage Example:**
```typescript
await dispatchAction('RECORDING_ADD_FRAME', {
  metadata: {
    action: 'click_submit',
    timestamp: Date.now(),
    status: 'success'
  }
}, tabId);
```

---

## RECORDING_STOP
Stop the current recording session.

**Returns:**
object - Complete recording data:
```typescript
interface Recording {
  id: string;
  startTime: number;
  endTime: number;
  frameCount: number;
  frames: Array<{
    timestamp: number;
    snapshot?: any;
    screenshot?: string; // base64
    metadata?: object;
  }>;
  metadata: object;
}
```

**Usage Example:**
```typescript
const recording = await dispatchAction('RECORDING_STOP', {}, tabId);
console.log(`Recording completed: ${recording.frameCount} frames captured`);
```

---

## RECORDING_RESTART
Restart the current recording session, clearing existing frames.

**Parameters:**
- `options` (optional): Same as RECORDING_START options (uses previous options if not specified)

**Usage Example:**
```typescript
await dispatchAction('RECORDING_RESTART', {
  options: {
    frameInterval: 1000,
    includeScreenshots: false
  }
}, tabId);
```

---

## GET_LAST_RECORDING_FRAMES
Get frames from the most recent recording session.

**Parameters:**
- `limit` (optional): number (Maximum number of frames to return, default: all)
- `offset` (optional): number (Start from frame offset, default: 0)
- `includeSnapshots` (optional): boolean (Include snapshot data, default: true)
- `includeScreenshots` (optional): boolean (Include screenshot data, default: true)

**Returns:**
Array of recording frames.

**Usage Example:**
```typescript
// Get last 10 frames without screenshots
const recentFrames = await dispatchAction('GET_LAST_RECORDING_FRAMES', {
  limit: 10,
  includeScreenshots: false
}, tabId);
```

## Best Practices

1. **Recording Configuration:**
   - Use longer frame intervals (1000-2000ms) for long-running sessions to reduce file size
   - Disable screenshots unless visual evidence is critical - they significantly increase recording size
   - Set appropriate `maxFrames` to prevent memory issues for very long sessions

2. **Performance:**
   - Recording with full snapshots and high-frequency frames can impact page performance
   - Consider reducing frame rate during intensive automation tasks
   - Stop recordings when not needed to free up resources

3. **Metadata:**
   - Add custom metadata to frames to mark important events (clicks, form submissions, errors)
   - Include timestamps and action descriptions for easier post-processing
   - Use metadata to tag successful vs failed steps in test scenarios

4. **Storage:**
   - Recordings can become large, especially with screenshots
   - Compress and persist recordings to disk after capture
   - Consider streaming frames to external storage for very long recordings

## Common Use Cases

### Test Case Recording
```typescript
// Start recording for test case
const recordingId = await dispatchAction('RECORDING_START', {
  options: {
    frameInterval: 500,
    includeScreenshots: true
  }
}, tabId);

try {
  // Execute test steps
  await dispatchAction('CLICK', { selectorOrRef: 'button#start' }, tabId);
  await dispatchAction('RECORDING_ADD_FRAME', { metadata: { step: 'start_clicked' } }, tabId);
  
  await dispatchAction('FILL', { selectorOrRef: 'input#email', value: 'test@example.com' }, tabId);
  await dispatchAction('RECORDING_ADD_FRAME', { metadata: { step: 'email_filled' } }, tabId);
  
  // More test steps...
  
  const recording = await dispatchAction('RECORDING_STOP', {}, tabId);
  
  // Save recording for debugging
  await saveRecordingToFile(recording, 'test-case-success.json');
} catch (error) {
  // Capture final frame on error
  await dispatchAction('RECORDING_ADD_FRAME', { 
    metadata: { error: error.message, step: 'failed' } 
  }, tabId);
  
  const recording = await dispatchAction('RECORDING_STOP', {}, tabId);
  await saveRecordingToFile(recording, 'test-case-failure.json');
  throw error;
}
```

### Demo Recording
```typescript
// Start high-quality demo recording
await dispatchAction('RECORDING_START', {
  options: {
    frameInterval: 300,
    includeScreenshots: true,
    screenshotQuality: 90
  }
}, tabId);

// Execute demo steps with pauses
await performDemoStep1();
await delay(1000);
await dispatchAction('RECORDING_ADD_FRAME', { metadata: { step: 1 } }, tabId);

await performDemoStep2();
await delay(1000);
await dispatchAction('RECORDING_ADD_FRAME', { metadata: { step: 2 } }, tabId);

// ... more steps

const demoRecording = await dispatchAction('RECORDING_STOP', {}, tabId);
await exportRecordingToVideo(demoRecording, 'demo-video.mp4');
```

### Debugging Session Recording
```typescript
// Start lightweight recording for debugging
await dispatchAction('RECORDING_START', {
  options: {
    frameInterval: 100,
    includeSnapshots: true,
    includeScreenshots: false,
    maxFrames: 500
  }
}, tabId);

// Reproduce bug
await reproduceBugScenario();

// Get frames for analysis
const frames = await dispatchAction('GET_LAST_RECORDING_FRAMES', {}, tabId);
analyzeRecordingFrames(frames);
```

## Post-Processing

Recordings can be post-processed to:
- Generate step-by-step documentation
- Create video demos of workflows
- Analyze user interactions for UX research
- Debug failed test cases by reviewing the exact state at each step
- Replay sessions to reproduce issues
