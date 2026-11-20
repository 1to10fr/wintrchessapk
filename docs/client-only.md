# Client-only build (runs on old devices)

Analysis and move classification run in the browser, so no server logic,
database or accounts are needed. Only static files are served.

## Run

```sh
npm ci
npm run build -w shared
npm run build -w client
node serve.mjs          # PORT=8080 by default; needs only Node.js
```

Then open `http://localhost:8080/analysis`. Any static host works too
(map `/analysis` to `client/public/apps/features/analysis.html`).

## Old browsers

- Build targets Chrome 49 / Safari 10 / Android 5 and up (ES5 output, core-js).
- Browsers without WebAssembly automatically use the asm.js engine.
- On slow devices pick **Stockfish 17 Lite** (the default) in the engine
  settings; the full engine is about 70 MB.

## Not included

Accounts, sign-in, the game archive and the news page still need the original
server and are not part of this build.

## License

Derived from [WintrCat/wintrchess](https://github.com/wintrcat/wintrchess),
GPL-3.0. This copy and any changes must stay GPL-3.0 and keep that credit.
