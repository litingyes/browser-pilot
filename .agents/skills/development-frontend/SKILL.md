---
name: development-frontend
description: Define baseline frontend engineering standards and legacy project audits. Use when users need project setup/configuration for Node.js + vite-plus workflows, commit/release governance, or compliance gap analysis against the frontend baseline.
---

# Frontend Development

## Purpose

Use this skill to standardize frontend engineering workflows for both new and existing projects:
- Bootstrap and normalize project tooling.
- Enforce code quality and git hook checks.
- Govern commit and release processes.
- Audit legacy repositories against required standards and output remediation actions.

## Scope And Boundaries

- Required baseline:
  - Node.js environment must be installed and available.
  - `vite-plus` (`vp`) is the required foundational CLI workflow.
  - Commit messages must follow Conventional Commits.
  - Release automation must use `bumpp` and `changelogen`.
- Recommended baseline:
  - Use `pnpm` as the package manager.
- Do not assume project-specific business logic, branching policy, or deployment platform details. Ask for clarification when missing.
- Keep this file as routing only; operational details belong in `references/`.

## Core Principles

1. **Executable standards**: every rule maps to a concrete command or config.
2. **Minimal migration cost**: prioritize low-risk, high-impact improvements first.
3. **Audit with evidence**: compliance decisions require reproducible checks.
4. **No ambiguous requirements**: unclear project constraints must be clarified.

## Module Routing

Read the following modules based on user intent:

1. **Environment and bootstrap**
   - See [Environment and Bootstrap](references/environment-and-bootstrap.md)
2. **Code quality and hooks**
   - See [Code Quality and Hooks](references/code-quality-and-hooks.md)
3. **Commit and release workflow**
   - See [Commit and Release](references/commit-and-release.md)
4. **Legacy project audit and remediation**
   - See [Project Audit and Remediation](references/project-audit-and-remediation.md)

## Minimal Output Contract

For any frontend lifecycle task, always provide:
- Selected module and why it applies.
- Completed checks/configuration items with evidence commands.
- Compliance gaps and impact level (blocker/high/medium/low).
- Actionable remediation plan with expected outcome.
- Final status (`compliant` / `partially-compliant` / `non-compliant`) and next actions.
