#!/bin/bash
set -e

echo -e "\\e[1;31mStarting FLASH Architecture Verification Simulation...\\e[0m"

# 1. Build the Project
npm run build --silent

# 2. Create the Rules File
echo -e "\\n\\e[1;33m[1] Defining Architectural Boundaries (.flash_rules.json)...\\e[0m"
cat << 'EOF' > .flash_rules.json
{
  "boundaries": [
    {
      "from": "src/cli.ts",
      "disallow": ["src/parser*"]
    }
  ]
}
EOF

# 3. Deliberately violate the rule
echo -e "\\n\\e[1;33m[2] Creating a deliberate architectural violation...\\e[0m"
# src/cli.ts does not currently import src/parser.ts directly (it imports indexer which imports parser).
# We will temporarily inject a direct import to see if the engine catches it.
cp src/cli.ts src/cli.ts.bak
sed -i '1s/^/import { ASTParser } from ".\/parser";\n/' src/cli.ts

# 4. Run `flash verify`
echo -e "\\n\\e[1;33m[3] Running \`flash verify\` (Expecting Failure)...\\e[0m"
set +e
node dist/cli.js verify
EXIT_CODE=$?
set -e

if [ $EXIT_CODE -ne 0 ]; then
  echo -e "\\e[1;32m✔ Simulation Passed: FLASH successfully blocked the architectural violation.\\e[0m"
else
  echo -e "\\e[1;31m✘ Simulation Failed: FLASH allowed the violation.\\e[0m"
  exit 1
fi

# Cleanup
mv src/cli.ts.bak src/cli.ts
rm .flash_rules.json
