import type { SnapshotRef } from './snapshot'

// attach manager
interface TabState {
  attached: boolean
  refs: Record<string, SnapshotRef>
}
const tabStates = new Map<number, TabState>()

export function ensureTabState(tabId: number) {
  if (!tabStates.has(tabId)) {
    tabStates.set(tabId, {
      attached: false,
      refs: {},
    })
  }

  return tabStates.get(tabId)!
}

export function updateSnapshot(tabId: number, snapshot: Record<string, SnapshotRef>) {
  const tabState = ensureTabState(tabId)
  tabState.refs = snapshot
}
