# Session Recording Operations

This document covers lightweight frame recording actions implemented in `browser-use`.

---

## RECORDING_START
Start a recording buffer.

**Parameters:**
- `path`: string

**Returns:**
- `{ started: true, path: string }`

**Usage Example:**
```typescript
const result = await dispatchAction('RECORDING_START', {
  path: 'session-1.webm',
}, tabId)
```

---

## RECORDING_ADD_FRAME
Push one frame payload into current recording.

**Parameters:**
- `frameData`: `string | Uint8Array | ArrayBuffer`

**Usage Example:**
```typescript
await dispatchAction('RECORDING_ADD_FRAME', {
  frameData: 'data:image/jpeg;base64,...',
}, tabId)
```

---

## RECORDING_STOP
Stop the current recording session.

**Returns:**
- `{ path: string, frames: number, note: string }`
- Throws when there is no active recording or no frames captured.

**Usage Example:**
```typescript
const result = await dispatchAction('RECORDING_STOP', {}, tabId)
console.log(result.frames)
```

---

## RECORDING_RESTART
Best-effort stop current recording and start a new one.

**Parameters:**
- `path`: string

**Usage Example:**
```typescript
await dispatchAction('RECORDING_RESTART', {
  path: 'session-2.webm',
}, tabId)
```

---

## GET_LAST_RECORDING_FRAMES
Get frames from the most recent recording session.

**Parameters:** none

**Returns:**
- `string[]` (base64 JPEG frames)

**Usage Example:**
```typescript
const recentFrames = await dispatchAction('GET_LAST_RECORDING_FRAMES', {}, tabId)
```

## Best Practices

1. Start with `RECORDING_START`.
2. Feed frames via `RECORDING_ADD_FRAME` (typically screenshot base64).
3. Stop with `RECORDING_STOP`.
4. Read latest frames with `GET_LAST_RECORDING_FRAMES` if needed for external encoding.
