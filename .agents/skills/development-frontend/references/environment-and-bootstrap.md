# Environment and Bootstrap

## Goal

Establish a reproducible baseline for frontend projects using required tooling:
- Node.js runtime available in local/CI environments.
- `vite-plus` (`vp`) as the foundational CLI workflow.
- `pnpm` as the recommended package manager.

## When To Use

- Creating a new frontend repository.
- Normalizing a repository with inconsistent local setup.
- Preparing a legacy project before quality/release governance.

## Required Inputs

- Project path.
- Node.js version policy (if the team already has one).
- Target framework stack (only for scaffold details; this document remains toolchain-focused).

## Workflow

1. Validate runtime availability.
   - Run `node -v`.
   - Run `npm -v` (or `pnpm -v` if already installed).
   - If Node.js is unavailable, stop and install from [Node.js official site](https://nodejs.org/en).
2. Validate `vite-plus` CLI availability.
   - Run `vp --help` (or project-defined equivalent entrypoint).
   - If unavailable, install/configure `vite-plus` following the official guide and re-run the check.
3. Normalize package manager choice.
   - Prefer `pnpm` for all install/run scripts.
   - Ensure project docs/scripts do not mix multiple package managers without explicit reason.
4. Baseline smoke checks.
   - Run `vp check` to validate formatting/lint/type status.
   - If needed, run `vp check --fix` and re-run `vp check` for clean output.

## Quality Gates

- [ ] `node -v` succeeds in local environment and CI runtime.
- [ ] `vp` command is callable in repository context.
- [ ] Project scripts and docs use `pnpm` as default package manager (recommended).
- [ ] Baseline `vp check` result is captured.

## Common Pitfalls

- Installing Node.js locally but not aligning CI images.
- Mixing `npm`/`yarn`/`pnpm` commands across docs and scripts.
- Assuming `vp` exists globally without project-level verification.

## Required Output

- Runtime check evidence (commands + outcome).
- Toolchain readiness status (`ready` / `blocked`).
- Any blockers and immediate remediation actions.
