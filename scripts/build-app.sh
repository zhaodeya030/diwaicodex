#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  DailyDo — build distributable app
#
#  On macOS: produces a .dmg you can share with anyone
#  On Linux: produces a .deb / AppImage
#  On Windows: produces an .msi / .exe installer
#
#  Prerequisites (macOS):
#    1. Rust  → curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
#    2. Node  → https://nodejs.org  (or: brew install node)
#    3. Xcode Command Line Tools → xcode-select --install
#
#  Usage:
#    bash scripts/build-app.sh
# ─────────────────────────────────────────────────────────────

set -e

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_DIR"

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BOLD}DailyDo — App Builder${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Check prerequisites ───────────────────────────────────────
check_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo -e "${RED}✗  '$1' not found.${NC} $2"
    exit 1
  fi
  echo -e "${GREEN}✓${NC}  $1"
}

echo ""
echo "Checking prerequisites…"
check_cmd "node"  "Install from https://nodejs.org"
check_cmd "npm"   "Comes with Node.js"
check_cmd "cargo" "Install Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
check_cmd "python3" "Install from https://www.python.org"

# ── Install npm dependencies ──────────────────────────────────
echo ""
echo "Installing npm packages…"
npm install

# ── Generate icons if missing ─────────────────────────────────
ICON_ICNS="src-tauri/icons/icon.icns"
if [ ! -f "$ICON_ICNS" ]; then
  echo ""
  echo "Generating app icons…"
  python3 scripts/gen-icon.py
  npx tauri icon app-icon.png
  echo -e "${GREEN}✓${NC}  Icons generated"
else
  echo ""
  echo -e "${GREEN}✓${NC}  Icons already exist"
fi

# ── Enable bundling in tauri.conf.json ───────────────────────
# Use python3 to toggle bundle.active without installing extra tools
python3 - << 'PY'
import json, os
conf_path = 'src-tauri/tauri.conf.json'
with open(conf_path) as f:
    conf = json.load(f)
conf['bundle']['active'] = True
with open(conf_path, 'w') as f:
    json.dump(conf, f, indent=2)
    f.write('\n')
print('✓  bundle.active set to true')
PY

# ── Build ─────────────────────────────────────────────────────
echo ""
echo "Building DailyDo (this may take a few minutes on first run)…"
echo ""
npm run tauri:build

# ── Restore bundle.active = false for development ─────────────
python3 - << 'PY'
import json
conf_path = 'src-tauri/tauri.conf.json'
with open(conf_path) as f:
    conf = json.load(f)
conf['bundle']['active'] = False
with open(conf_path, 'w') as f:
    json.dump(conf, f, indent=2)
    f.write('\n')
PY

# ── Find and report the output ────────────────────────────────
echo ""
echo -e "${BOLD}Build complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ "$OSTYPE" == "darwin"* ]]; then
  DMG=$(find src-tauri/target/release/bundle/dmg -name "*.dmg" 2>/dev/null | head -1)
  if [ -n "$DMG" ]; then
    echo -e "${GREEN}✓  macOS DMG ready:${NC}"
    echo "   $DMG"
    echo ""
    echo "To install on this Mac:"
    echo "   open \"$DMG\""
    echo ""
    echo "To share with friends:"
    echo "   Send them the .dmg file — they just drag DailyDo to Applications."
  fi
elif [[ "$OSTYPE" == "linux"* ]]; then
  echo "Linux packages in: src-tauri/target/release/bundle/"
  ls src-tauri/target/release/bundle/ 2>/dev/null || true
fi

echo ""
