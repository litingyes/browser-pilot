import type { RecordingState } from './recording'
import type { SnapshotRef } from './snapshot'
import { newRecordingState } from './recording'

// attach manager
interface TabState {
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

export function updateTabState(tabId: number, state: Partial<TabState>) {
  const tabState = ensureTabState(tabId)
  tabState.refs = { ...tabState.refs, ...state.refs }
}
