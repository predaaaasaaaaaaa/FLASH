#!/bin/bash
set -e

echo -e "\\e[1;31mStarting FLASH Multi-Repo Telepathy Simulation...\\e[0m"

# 1. Build the Project
npm run build --silent

# 2. Setup workspaces
mkdir -p mock_repo_A
mkdir -p mock_repo_B

# 3. Simulate Repo A (The Provider)
cd mock_repo_A
git init >/dev/null 2>&1
echo "export function api(requiredParam: string) { return 'v2'; }" > api.ts
git add api.ts
git commit -m "feat: upgrade api to v2 with breaking change" >/dev/null 2>&1

# Sync Git into FLASH for Repo A
node ../dist/cli.js sync-git >/dev/null 2>&1
cd ..

# 4. Simulate Repo B (The Consumer)
cd mock_repo_B
# Link to Repo A
mkdir -p .flash
echo '["../mock_repo_A"]' > .flash/links.json

echo "import { api } from '../mock_repo_A/api'; api();" > consumer.ts

# Intercept a failure (Repo B failed because of Repo A's change)
set +e
node ../dist/cli.js run npx tsc consumer.ts --noEmit --ignoreConfig >/dev/null 2>&1
set -e

# Query FLASH
echo -e "\\n\\e[1;33m[1] Querying FLASH in Repo B: 'why did it fail'\\e[0m"
export MOCK_LLM_RETURN_CONTEXT="1"
OUTPUT=$(node ../dist/cli.js "why did it fail")
echo "$OUTPUT"

if echo "$OUTPUT" | grep -q "in linked repository '../mock_repo_A'"; then
  echo -e "\\n\\e[1;32m✔ Simulation Passed: FLASH successfully correlated the failure across repositories!\\e[0m"
else
  echo -e "\\n\\e[1;31m✘ Simulation Failed: Did not find the linked repository in the output.\\e[0m"
  exit 1
fi

# Cleanup
cd ..
rm -rf mock_repo_A mock_repo_B
