# Project Audit and Remediation

## Goal

Audit an existing frontend repository against the baseline standard and provide prioritized remediation guidance.

## When To Use

- Taking over legacy projects.
- Running pre-release governance checks.
- Measuring compliance drift after long-term maintenance.

## Audit Dimensions

1. Runtime baseline:
   - Node.js availability and version policy alignment.
2. Toolchain baseline:
   - `vite-plus` (`vp`) adopted as primary CLI workflow.
3. Quality baseline:
   - `vp lint`, `vp format`, `vp check` available and executable.
   - `vp config` hook integration and `vp staged` staged-file checks.
4. Commit baseline:
   - Commit messages follow Conventional Commits.
5. Release baseline:
   - `bumpp` integrated for version bumping.
   - `changelogen` integrated for changelog generation/release flow.

## Evidence Collection

- Tool versions:
  - `node -v`
  - `vp --help`
- Quality commands:
  - `vp lint`
  - `vp check`
  - `vp staged` (with staged files in dry-run workflow)
- Commit history sampling:
  - Inspect recent commits for Conventional Commits pattern.
- Release readiness:
  - `npx bumpp --help`
  - `npx changelogen@latest --help`
  - Existing `CHANGELOG.md` and release scripts presence.

## Severity Model

- `blocker`: prevents stable development/release directly.
- `high`: major governance or quality risk.
- `medium`: should fix in current iteration.
- `low`: improvement opportunity, non-blocking.

## Remediation Prioritization Rules

1. Resolve all `blocker` items first.
2. Then fix high-impact/low-risk items.
3. Group related medium/low items into one low-cost refactor batch.
4. After each batch, re-run audit checks and compare deltas.

## Output Template

### 1) Compliance Conclusion

- Final status: `compliant` / `partially-compliant` / `non-compliant`
- Audit scope and evidence timestamp.

### 2) Gap List

- `ID`
- `Dimension`
- `Observed State`
- `Expected State`
- `Severity`
- `Evidence`

### 3) Remediation Plan

- `Action`
- `Owner`
- `Priority`
- `Effort`
- `Expected Outcome`
- `Verification Command`

## Required Output

- A complete, reproducible audit report with evidence-based findings.
- A prioritized, executable remediation backlog.
- Re-audit checkpoints to confirm improvement completion.
