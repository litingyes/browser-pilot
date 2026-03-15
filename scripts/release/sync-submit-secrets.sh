#!/usr/bin/env bash

set -euo pipefail

ENV_FILE="${1:-packages/extension/.env.submit}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE"
  echo "Run: pnpm --filter extension exec wxt submit init"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Run: gh auth login"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

required_keys=(
  CHROME_EXTENSION_ID
  CHROME_CLIENT_ID
  CHROME_CLIENT_SECRET
  CHROME_REFRESH_TOKEN
  FIREFOX_EXTENSION_ID
  FIREFOX_JWT_ISSUER
  FIREFOX_JWT_SECRET
  EDGE_PRODUCT_ID
  EDGE_CLIENT_ID
  EDGE_API_KEY
)

for key in "${required_keys[@]}"; do
  value="${!key:-}"
  if [[ -z "$value" ]]; then
    echo "Skip empty key: $key"
    continue
  fi

  printf '%s' "$value" | gh secret set "$key"
  echo "Updated GitHub secret: $key"
done

echo "Secret sync complete."
