# Code Quality and Hooks

## Goal

Enforce consistent quality checks through `vite-plus` commands and git hooks:
- `vp lint` for linting.
- `vp format` for formatting.
- `vp check` for combined static checks.
- `vp staged` and `vp config` for pre-commit enforcement.

## When To Use

- Setting project-wide quality guardrails.
- Migrating existing repositories from ad-hoc lint-staged/husky setups.
- Hardening pre-commit checks before active team collaboration.

## Workflow

1. Define lint strategy.
   - Run `vp lint` for baseline.
   - Use `vp lint --fix` where safe.
2. Define format strategy.
   - Run `vp format` (or project-defined format command through `vp` toolchain).
   - Ensure formatting command is part of contributor workflow.
3. Establish unified check command.
   - Use `vp check` for formatting/lint/type checks.
   - Optionally use `vp check --fix` before final verification.
4. Configure staged checks in Vite config.
   - Add `staged` rules in `vite.config.ts`:

```typescript
export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
});
```

5. Install git hook shims.
   - Run `vp config` to install hook lifecycle integration.
   - Validate by staging files and running `vp staged`.

## Quality Gates

- [ ] `vp lint` runs successfully in repository context.
- [ ] `vp format` is configured and executable.
- [ ] `vp check` is documented as default quality gate.
- [ ] `vite.config.ts` contains `staged` rule for staged-file checks.
- [ ] `vp config` hook integration is active.
- [ ] A staged-change dry run via `vp staged` is successful.

## Common Pitfalls

- Running lint/format manually but skipping staged hooks.
- Defining `staged` rules without ensuring `vp config` has been applied.
- Using non-`vp` quality commands that diverge from team standard.

## Required Output

- Effective quality command matrix (`lint` / `format` / `check` / `staged` / `hook`).
- Verification evidence (commands + outcomes).
- Missing pieces and prioritized remediation steps.
