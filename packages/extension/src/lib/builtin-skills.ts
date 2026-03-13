import type { IFsJSON, Skill } from '@/lib/indexeddb'
import { computeHash } from '@/lib/hash'
import { db } from '@/lib/indexeddb'

const BUILTIN_BROWSER_USE_SKILL_NAME = 'browser-use'
const BUILTIN_BROWSER_USE_SKILL_DESCRIPTION = 'Drive browser tabs with dispatchAction for snapshotting, element queries, interactions, storage, cookies, debugger CDP, and recording.'
const BUILTIN_BROWSER_USE_SKILL_PATH = 'browser-use/SKILL.md'

const BUILTIN_BROWSER_USE_SKILL_CONTENT = `---
name: browser-use
description: Drive browser tabs with dispatchAction for snapshotting, element queries, interactions, storage, cookies, debugger CDP, and recording.
---

# Browser Use Skill

Use this skill when tasks require direct tab automation through \`dispatchAction\`.

## Preconditions

- Ensure \`typeId\` is the target browser tab id.
- Prefer \`selectorOrRef\` from a recent \`GET_SNAPSHOT\` result.
- Use \`ATTACH_DEBUGGER\` before actions that require CDP connection.
- Treat \`SEND_CDP\` as high-risk: only call when standard actions cannot solve the task.

## Action Groups

### Snapshot & refs

- \`GET_SNAPSHOT\`: capture page snapshot and refs for follow-up actions.
- \`PARSE_REF\`: parse a ref string for diagnostics.
- \`ENSURE_TAB_STATE\`, \`UPDATE_TAB_STATE\`: manage tab-scoped runtime state.

### Element read/query

- \`GET_ELEMENT_TEXT\`
- \`GET_ELEMENT_ATTRIBUTE\`
- \`IS_ELEMENT_VISIBLE\`
- \`IS_ELEMENT_ENABLED\`
- \`IS_ELEMENT_CHECKED\`
- \`GET_ELEMENT_INNER_TEXT\`
- \`GET_ELEMENT_INNER_HTML\`
- \`GET_ELEMENT_INPUT_VALUE\`
- \`GET_ELEMENT_BOUNDING_BOX\`
- \`GET_ELEMENT_COUNT\`
- \`GET_ELEMENT_STYLES\`
- \`RESOLVE_ELEMENT_CENTER\`
- \`RESOLVE_ELEMENT_OBJECT_ID\`

### Element interaction

- \`CLICK\` / \`DBLCLICK\`
- \`HOVER\`
- \`FILL\` / \`TYPE_TEXT\` / \`CLEAR\`
- \`PRESS_KEY\`
- \`FOCUS\`
- \`CHECK\` / \`UNCHECK\`
- \`SELECT_OPTION\`
- \`SELECT_ALL\`
- \`SCROLL\` / \`SCROLL_INTO_VIEW\`
- \`DISPATCH_EVENT\`
- \`SET_ELEMENT_VALUE\`
- \`TAP_TOUCH\`
- \`HIGHLIGHT\`

### Visuals

- \`TAKE_SCREENSHOT\`

### Cookies

- \`GET_COOKIES\`
- \`SET_COOKIES\`
- \`CLEAR_COOKIES\`

### Storage

- \`GET_STORAGE\`
- \`SET_STORAGE\`
- \`CLEAR_STORAGE\`

### Debugger / CDP

- \`ATTACH_DEBUGGER\`
- \`SEND_CDP\`

### Recording

- \`RECORDING_START\`
- \`RECORDING_ADD_FRAME\`
- \`RECORDING_STOP\`
- \`RECORDING_RESTART\`
- \`GET_LAST_RECORDING_FRAMES\`

## Recommended Flow

1. \`GET_SNAPSHOT\` to locate stable refs.
2. Read page state with element query actions.
3. Execute interactions (\`CLICK\`, \`TYPE_TEXT\`, \`PRESS_KEY\`, etc.).
4. Verify result with \`GET_SNAPSHOT\` or element reads.
5. Capture evidence with \`TAKE_SCREENSHOT\` when needed.

## Guardrails

- Avoid raw \`SEND_CDP\` unless absolutely necessary.
- Keep commands minimal and deterministic.
- Re-snapshot after page changes before using old refs.
`

const BUILTIN_SKILL_NAME_SET = new Set([BUILTIN_BROWSER_USE_SKILL_NAME.toLowerCase()])

export function isReservedBuiltinSkillName(name: string) {
  return BUILTIN_SKILL_NAME_SET.has(name.trim().toLowerCase())
}

async function buildBuiltinBrowserUseSkill(now: number): Promise<Skill> {
  const files: IFsJSON = {
    [BUILTIN_BROWSER_USE_SKILL_PATH]: {
      type: 'file',
      content: BUILTIN_BROWSER_USE_SKILL_CONTENT,
    },
  }

  return {
    name: BUILTIN_BROWSER_USE_SKILL_NAME,
    description: BUILTIN_BROWSER_USE_SKILL_DESCRIPTION,
    computedHash: await computeHash(files),
    createdAt: now,
    updatedAt: now,
    files,
  }
}

export async function initBuiltinSkills() {
  const now = Date.now()
  const builtinSkills = [await buildBuiltinBrowserUseSkill(now)]

  for (const skill of builtinSkills) {
    const existing = await db.skills.get(skill.name)
    if (!existing) {
      await db.skills.add(skill)
    }
  }
}
