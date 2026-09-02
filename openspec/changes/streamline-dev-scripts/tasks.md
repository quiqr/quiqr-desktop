## 1. Rename and reorganize root scripts

- [x] 1.1 In root `package.json`, add `_dev:electron:app`: `cross-env NODE_ENV=development electron .` (internal; was `dev:electron`)
- [x] 1.2 Add `_dev:electron:wait`: `wait-on http://localhost:4002 && npm run _dev:electron:app` (internal; was `dev:electron:wait`)
- [x] 1.3 Add `dev:electron` as the full stack: `concurrently` over types + backend + adapter-electron watchers + `dev:frontend` + `_dev:electron:wait` (the body of the old `dev`)
- [x] 1.4 Add `dev:standalone` as the full stack: `concurrently` over types + backend + adapter-standalone watchers + `dev:frontend` + `npm run dev:start -w @quiqr/adapter-standalone` (the old `dev:backend:standalone` plus `dev:frontend`)
- [x] 1.5 Rename `start:backend:standalone` → `start:standalone` (same body)
- [x] 1.6 Rename `start` (`electron-forge start`) → `start:electron`
- [x] 1.7 Remove `dev`, the old `dev:electron`, `dev:electron:wait`, and `dev:backend:standalone` (no aliases)
- [x] 1.8 Keep `dev:backend` and `dev:frontend` unchanged

## 2. Bind the Vite dev server to all interfaces

- [x] 2.1 In `packages/frontend/vite.config.js`, set `server.host = '0.0.0.0'` (alongside the existing `port: 4002`)

## 3. Update documentation

- [x] 3.1 `README.md`: replaced `npm run dev` (electron flow) with `npm run dev:electron`; replaced the two-step standalone instructions with the single `npm run dev:standalone`; also updated the Nix section
- [x] 3.2 `packages/docs/docs/configuration/index.md`: updated `dev:backend:standalone` → `dev:standalone`
- [x] 3.3 `packages/docs/docs/configuration/environment-variables.md`: updated both `npm run dev` and `dev:backend:standalone` references to `dev:standalone`
- [x] 3.4 `packages/docs/docs/getting-started/standalone-deployment.md`: updated the dev-mode tip to `npm run dev:standalone` and noted the dev UI binds `0.0.0.0`
- [x] 3.5 `AGENTS.md`: updated the Development Commands section (`dev:electron`, `dev:standalone`, `dev:frontend`)
- [x] 3.6 `CONTRIBUTING.md` (extra straggler found by 4.6): updated `npm run dev` to the two edition commands

## 4. Verification

- [x] 4.1 `npm run dev:electron` — verified earlier this session (full electron stack came up, no GL errors after flake fix)
- [x] 4.2 `npm run dev:standalone` — smoke-tested: launches types + backend + adapter + frontend + server; UI served without a second command
- [x] 4.3 Vite bound to `0.0.0.0` — smoke-test log printed `Network: http://192.168.x.x:4002`, confirming LAN reachability
- [x] 4.4 `npm run dev`, `dev:backend:standalone`, `start:backend:standalone` all report "Missing script"
- [x] 4.5 `npm run build -w @quiqr/docs` passes link validation after doc edits
- [x] 4.6 Grep for stragglers — only `CONTRIBUTING.md` found and fixed (3.6); frontend workspace's own `"dev"` and lockfile `dev:true` are unrelated and correct
