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

# Capacitor's WebView serves index.html for every address without a file
# extension, so /settings would reopen the analysis page. index.html is
# therefore a tiny router that loads the bundle matching the address.
cp client/public/apps/features/analysis.html "$W/index.html"
python3 - "$W/index.html" <<'PY'
import sys
p = sys.argv[1]
s = open(p).read()
router = """<style>a[href="/signin"] { display: none !important; }</style>
    <script>
    (function () {
        var path = location.pathname;
        var bundle = "analysis";

        if (path.indexOf("/settings") == 0) bundle = "settings";
        else if (path.indexOf("/archive") == 0) bundle = "archive";
        else if (path.indexOf("/news") == 0) bundle = "news";
        else if (path.indexOf("/help") == 0) bundle = "helpCenter";
        else if (path.indexOf("/legal") == 0) bundle = "legal";
        else if (path.indexOf("/analysis") != 0) {
            history.replaceState(null, "", "/analysis");
        }

        var script = document.createElement("script");
        script.src = "/" + bundle + ".bundle.js";
        document.body.appendChild(script);
    })();
    </script>"""
s = s.replace('<script src="/analysis.bundle.js"></script>', router)
open(p, "w").write(s)
PY
