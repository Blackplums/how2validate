#!/bin/sh

npx tsc --project tsconfig.scripts.json

# 1. Compile the script
npx tsc scripts/generate-supported-secrets-table.ts --outDir dist/scripts/

# 2. Run the script (no renaming needed)
node dist/scripts/generate-supported-secrets-table.js || exit 1