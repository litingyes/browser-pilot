import type { RecordingState } from './recording'
import type { SnapshotRef } from './snapshot'
import { newRecordingState } from './recording'

// attach manager
export interface TabState {
  attached: boolean
  refs: Record<string, SnapshotRef>
  recordingState: RecordingState
}
const tabStates = new Map<number, TabState>()

export function ensureTabState(tabId: number) {
  if (!tabStates.has(tabId)) {
    tabStates.set(tabId, {
      attached: false,
      refs: {},
      recordingState: newRecordingState(),
    })
  }

  return tabStates.get(tabId)!
}

export function getTabState(tabId: number) {
  return tabStates.get(tabId)
}

export function removeTabState(tabId: number) {
  return tabStates.delete(tabId)
}

export function updateTabState(tabId: number, state: Partial<TabState>) {
  const tabState = ensureTabState(tabId)

  if (typeof state.attached === 'boolean') {
    tabState.attached = state.attached
  }
  if (state.refs) {
    tabState.refs = { ...tabState.refs, ...state.refs }
  }
  if (state.recordingState) {
    tabState.recordingState = state.recordingState
  }
}
