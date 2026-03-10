import { attachDebugger, sendCdp } from './debugger'
import { ensureTabState } from './state'

const INTERACTIVE_ROLES = new Set([
  'button',
  'link',
  'textbox',
  'checkbox',
  'radio',
  'combobox',
  'listbox',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'searchbox',
  'slider',
  'spinbutton',
  'switch',
  'tab',
  'treeitem',
])

const CONTENT_ROLES = new Set([
  'heading',
  'cell',
  'gridcell',
  'columnheader',
  'rowheader',
  'listitem',
  'article',
  'region',
  'main',
  'navigation',
])

interface AXValue {
  value?: string | number | boolean
}

interface AXProperty {
  name: string
  value?: AXValue
}

interface AXNode {
  nodeId: string
  role?: AXValue
  name?: AXValue
  value?: AXValue
  ignored?: boolean
  properties?: AXProperty[]
  backendDOMNodeId?: number
  childIds?: string[]
}

interface AXTreeResponse {
  nodes?: AXNode[]
}

interface TreeNode {
  role: string
  name: string
  valueText?: string
  children: number[]
  hasRef: boolean
  refId?: string
  backendNodeId?: number
}

export interface SnapshotRef {
  role: string
  name: string
  backendNodeId?: number
  nth?: number
}

function axToString(value?: AXValue): string {
  if (value?.value === undefined || value?.value === null) {
    return ''
  }
  return String(value.value)
}

function buildTree(nodes: AXNode[]) {
  const treeNodes: TreeNode[] = []
  const nodeIdToIndex = new Map<string, number>()
  const isChild = new Set<number>()

  for (const [index, node] of nodes.entries()) {
    const role = axToString(node.role)
    const isIgnored = Boolean(node.ignored) && role !== 'RootWebArea'

    treeNodes.push({
      role: isIgnored ? '' : role,
      name: isIgnored ? '' : axToString(node.name),
      valueText: isIgnored ? '' : axToString(node.value),
      children: [],
      hasRef: false,
      backendNodeId: node.backendDOMNodeId,
    })
    nodeIdToIndex.set(node.nodeId, index)
  }

  for (const [parentIndex, node] of nodes.entries()) {
    for (const childId of node.childIds ?? []) {
      const childIndex = nodeIdToIndex.get(childId)
      if (childIndex === undefined) {
        continue
      }
      treeNodes[parentIndex].children.push(childIndex)
      isChild.add(childIndex)
    }
  }

  const rootIndices: number[] = []
  for (let index = 0; index < treeNodes.length; index += 1) {
    if (!isChild.has(index)) {
      rootIndices.push(index)
    }
  }

  return { treeNodes, rootIndices }
}

function renderTree(nodes: TreeNode[], index: number, indent: number, lines: string[]) {
  const node = nodes[index]
  if (!node || !node.role) {
    for (const child of node?.children ?? []) {
      renderTree(nodes, child, indent, lines)
    }
    return
  }

  if (node.role === 'RootWebArea' || node.role === 'WebArea') {
    for (const child of node.children) {
      renderTree(nodes, child, indent, lines)
    }
    return
  }

  const attrs: string[] = []
  if (node.refId) {
    attrs.push(`ref=${node.refId}`)
  }

  const indentPrefix = '  '.repeat(indent)
  let line = `${indentPrefix}- ${node.role}`
  if (node.name) {
    line += ` "${node.name}"`
  }
  if (attrs.length > 0) {
    line += ` [${attrs.join(', ')}]`
  }
  if (node.valueText && node.valueText !== node.name) {
    line += `: ${node.valueText}`
  }

  lines.push(line)
  for (const child of node.children) {
    renderTree(nodes, child, indent + 1, lines)
  }
}

function isRefCandidate(node: TreeNode) {
  if (INTERACTIVE_ROLES.has(node.role)) {
    return true
  }
  if (CONTENT_ROLES.has(node.role)) {
    return Boolean(node.name)
  }
  return false
}

export async function getSnapshot(tabId: number) {
  await attachDebugger(tabId)
  await sendCdp(tabId, 'DOM.enable')
  await sendCdp(tabId, 'Accessibility.enable')

  const response = await sendCdp(tabId, 'Accessibility.getFullAXTree') as AXTreeResponse
  const nodes = response.nodes ?? []
  const { treeNodes, rootIndices } = buildTree(nodes)

  const roleNameCounts = new Map<string, number>()
  const roleNameSeen = new Map<string, number>()
  for (const node of treeNodes) {
    if (!isRefCandidate(node)) {
      continue
    }
    const key = `${node.role}:${node.name}`
    roleNameCounts.set(key, (roleNameCounts.get(key) ?? 0) + 1)
  }

  const refs: Record<string, SnapshotRef> = {}
  let refCounter = 1

  for (const node of treeNodes) {
    if (!isRefCandidate(node)) {
      continue
    }

    const key = `${node.role}:${node.name}`
    const seen = roleNameSeen.get(key) ?? 0
    roleNameSeen.set(key, seen + 1)
    const nth = (roleNameCounts.get(key) ?? 0) > 1 ? seen : undefined

    const refId = `e${refCounter}`
    refCounter += 1

    node.hasRef = true
    node.refId = refId
    refs[refId] = {
      role: node.role,
      name: node.name,
      backendNodeId: node.backendNodeId,
      nth,
    }
  }

  const tabState = ensureTabState(tabId)
  tabState.refs = refs

  const lines: string[] = []
  for (const rootIndex of rootIndices) {
    renderTree(treeNodes, rootIndex, 0, lines)
  }

  const snapshot = lines.join('\n').trim()
  return snapshot || '(empty page)'
}
