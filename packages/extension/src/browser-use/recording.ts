export interface RecordingState {
  active: boolean
  outputPath: string
  frameCount: number
  startedAt: number
  frames: string[]
  lastFrames: string[]
}

export interface RecordingStartResult {
  started: true
  path: string
}

export interface RecordingStopResult {
  path: string
  frames: number
  note: string
}

export interface RecordingRestartResult {
  restarted: true
  previousPath: string | null
  path: string
}

function toBase64Jpeg(frameData: string | Uint8Array | ArrayBuffer): string {
  if (typeof frameData === 'string') {
    const trimmed = frameData.trim()
    const prefix = 'data:image/jpeg;base64,'
    return trimmed.startsWith(prefix) ? trimmed.slice(prefix.length) : trimmed
  }

  const bytes = frameData instanceof Uint8Array ? frameData : new Uint8Array(frameData)
  let binary = ''
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index])
  }
  return btoa(binary)
}

export function newRecordingState(): RecordingState {
  return {
    active: false,
    frameCount: 0,
    frames: [],
    lastFrames: [],
    outputPath: '',
    startedAt: 0,
  }
}

export function recordingStart(state: RecordingState, path: string): RecordingStartResult {
  if (state.active) {
    throw new Error('Recording already active')
  }

  state.active = true
  state.outputPath = path
  state.frameCount = 0
  state.frames = []
  state.lastFrames = []
  state.startedAt = Date.now()

  return { started: true, path }
}

export function recordingAddFrame(
  state: RecordingState,
  frameData: string | Uint8Array | ArrayBuffer,
) {
  if (!state.active) {
    return
  }

  state.frames.push(toBase64Jpeg(frameData))
  state.frameCount += 1
}

export function recordingStop(state: RecordingState): RecordingStopResult {
  if (!state.active) {
    throw new Error('No recording in progress')
  }

  state.active = false

  if (state.frameCount === 0) {
    state.lastFrames = []
    state.frames = []
    state.outputPath = ''
    state.startedAt = 0
    throw new Error('No frames captured')
  }

  const frameCount = state.frameCount
  const outputPath = state.outputPath
  state.lastFrames = state.frames.slice()

  // Keep parity with native state transitions; extension-side encoding can be done by caller.
  state.outputPath = ''
  state.frameCount = 0
  state.startedAt = 0
  state.frames = []

  return {
    path: outputPath,
    frames: frameCount,
    note: 'Frames captured as base64 JPEGs in memory. Use getLastRecordingFrames() for external encoding.',
  }
}

export function recordingRestart(
  state: RecordingState,
  path: string,
): RecordingRestartResult {
  const previousPath = state.active ? state.outputPath : null

  if (state.active) {
    try {
      recordingStop(state)
    }
    catch {
      // Ignore stop failure and continue restart, mirroring native best-effort behavior.
    }
  }

  recordingStart(state, path)

  return {
    restarted: true,
    previousPath,
    path,
  }
}

export function getLastRecordingFrames(state: RecordingState) {
  return state.lastFrames.slice()
}
