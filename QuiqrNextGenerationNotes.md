# Milestones

## M1 Proof of Vital Requirements

- [x] Run Web and Desktop in compiled app 1.0.7
- [x] Run old React code base
- [x] combine with new server
- [x] get static routing working
- [x] crippled main-process-bridge
- [x] removed require.electron for net object (template browser)
- [x] removed electron stuff in App.js

to run old react code base:

```
cd frontend
SKIP_PREFLIGHT_CHECK=true NODE_OPTIONS=--openssl-legacy-provider npm run dev
```

open url: http://localhost:4002/sites

## M2 Backend service via http

- [x] port api to be used as http server

## M3 Mount sites

- [x] mount sites and get forms working

## Cleanups/Refactors

- [x] package.json upgrade old npms
- [x] backend remove unused js files
- [x] backend/electron upgrade to TS
- [x] frontend upgrade to TS
- [x] frontend upgrade to latest React
- [x] package.json remove unused 

## Long list of small and large todo's

- [x] top iconbar actions not working
- [x] collections not working
- [x] ugly red warning at electron startup
- [x] repo should be renamed (merged in ng-branch)
- [x] performance is slow (maybe swith with ipc and express)
- [x] after a while axios or express is not working anymore. Complete application Crash
    - [x] seems to be causes by not able to stop hugo server
    - [x] axios timeout settings seems to fix this a bit
- [x] templates gallery not working
- [x] background jobs not working (thumbnail not ported yet)

- [ ] large image collections cause Worker error: Error: Error: maxMemoryUsageInMB limit exceeded by at least 39MB
- [ ] log Window not working
- [ ] electron progress popup not correctly visible
- [ ] pipeline build failing
- [ ] menu-> File->select sites not working

## Webserver alternative/extra functions

- [ ] in main screen log window
- [ ] login screen
- [ ] disable stuff like preferences

