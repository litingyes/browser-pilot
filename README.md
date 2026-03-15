# Pilo

Your browser, on autopilot.

## Statement

1. [browser-use module](./packages/extension/src/browser-use) references [agent-browser](https://github.com/vercel-labs/agent-browser)

## Release

### One-time setup

1. Initialize WXT submit config in `packages/extension`:

```bash
pnpm --filter extension exec wxt submit init
```

2. Copy values into GitHub Actions secrets (repo settings):
   - `CHROME_EXTENSION_ID`
   - `CHROME_CLIENT_ID`
   - `CHROME_CLIENT_SECRET`
   - `CHROME_REFRESH_TOKEN`
   - `FIREFOX_EXTENSION_ID`
   - `FIREFOX_JWT_ISSUER`
   - `FIREFOX_JWT_SECRET`
   - `EDGE_PRODUCT_ID`
   - `EDGE_CLIENT_ID`
   - `EDGE_API_KEY`

### Version + release flow

1. Bump versions and create commit/tag:

```bash
pnpm release:bump
```

2. Open GitHub Actions `Release Extension` workflow and run with:
   - `dry_run=true` for preflight
   - `dry_run=false` for actual submit

### Local zip smoke check

```bash
pnpm release:zip
pnpm release:zip:firefox
```
