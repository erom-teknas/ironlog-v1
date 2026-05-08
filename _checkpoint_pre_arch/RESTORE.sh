#!/bin/bash
# Restore all files to the pre-architecture-refactor checkpoint.
# Run from the ironLog_v1 root: bash _checkpoint_pre_arch/RESTORE.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"

echo "Restoring pre-arch checkpoint to $ROOT ..."

cp "$SCRIPT_DIR/App.jsx"       "$ROOT/src/App.jsx"
cp "$SCRIPT_DIR/LogPage.jsx"   "$ROOT/src/pages/LogPage.jsx"
cp "$SCRIPT_DIR/PlansPage.jsx" "$ROOT/src/pages/PlansPage.jsx"
cp "$SCRIPT_DIR/utils.js"      "$ROOT/src/utils.js"
cp "$SCRIPT_DIR/constants.js"  "$ROOT/src/constants.js"
cp "$SCRIPT_DIR/vite.config.js" "$ROOT/vite.config.js"
cp "$SCRIPT_DIR/package.json"  "$ROOT/package.json"

echo "Done. Run 'npm run build' to verify."
