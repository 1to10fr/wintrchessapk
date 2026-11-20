#!/usr/bin/env bash
# Collects the built client into android-app/www for Capacitor.
# Run from the repository root after `npm run build -w client`.
set -euo pipefail

W=android-app/www
rm -rf "$W" && mkdir -p "$W/engines"

cp -r client/dist/. "$W/"
cp -r client/public/locales client/public/img client/public/fonts \
      client/public/audio "$W/"
cp client/public/favicon.ico "$W/"

# Only the Lite and asm.js engines are bundled; the full engine is ~70 MB
cp client/public/engines/stockfish-17-lite-single.* \
   client/public/engines/stockfish-17-asm.js "$W/engines/"

# The analysis page is the app's start page; open it on the /analysis route
cp client/public/apps/features/analysis.html "$W/index.html"
sed -i 's|<div class="root"></div>|<div class="root"></div>\n    <script>history.replaceState(null, "", "/analysis");</script>|' "$W/index.html"
