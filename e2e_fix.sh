#!/bin/bash
set -e

echo -e "\\e[1;31mStarting FLASH Auto-Fixer Simulation...\\e[0m"

# 1. Build the Project
npm run build --silent

# 2. Clean Slate
rm -f .flash/history.json

# 3. Create a broken file
echo -e "\\n\\e[1;33m[1] Creating a broken TypeScript file...\\e[0m"
cat << 'EOF' > broken_math.ts
export function add(a: number b: number) {
  return a + b;
}
EOF

# 4. Intercept the failure
echo -e "\\n\\e[1;33m[2] Compiling broken file via FLASH Interceptor...\\e[0m"
set +e
node dist/cli.js run npx tsc broken_math.ts --noEmit --ignoreConfig
set -e

# 5. Mock Config and LLM Response
cp ~/.flash_config.json ~/.flash_config.json.bak 2>/dev/null || true
echo '{"provider": "gemini", "apiKey": "dummy"}' > ~/.flash_config.json
export MOCK_LLM_RESPONSE="export function add(a: number, b: number) { return a + b; }"

# 6. Run Auto-Fixer
echo -e "\\n\\e[1;33m[3] Running \`flash fix\`...\\e[0m"
node dist/cli.js fix

# 7. Revert mocks
unset MOCK_LLM_RESPONSE
mv ~/.flash_config.json.bak ~/.flash_config.json 2>/dev/null || rm -f ~/.flash_config.json

# 8. Verify the fix
echo -e "\\n\\e[1;33m[4] Verifying the fix structurally...\\e[0m"
# The fix should now compile cleanly
node dist/cli.js run npx tsc broken_math.ts --noEmit --ignoreConfig

echo -e "\\n\\e[1;32m✔ Simulation Passed: FLASH Auto-Fixer successfully repaired the AST and applied it!\\e[0m"

# Cleanup
rm broken_math.ts .flash/history.json || true
