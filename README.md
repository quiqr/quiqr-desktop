# New Quiqr Desktop Home

This is a template for building a desktop application using Electron, Vite,
React, and Express. It is a full-stack application that uses Electron to run
the React frontend and Express backend. The frontend is built using Vite, and
the backend is built using Express.

The build will generate a standalone desktop application that can be run on
Windows, macOS, and Linux.

## Running Locally

1. Clone the repository
2. Run `npm install` to install the dependencies
3. `cd frontend` and run `npm install --legacy-peer-deps` to install the frontend dependencies
4. You may need to run `npm run build` in the `frontend` folder to build the frontend.
5. Run `npm run dev` to start the development server
6. React app will be running on [http://localhost:5173](http://localhost:5173)

## Building the Installers

1. Run `npm run build` to build the installers
2. The installers will be generated in the `dist` folder

### (Optiona) Manual builds

- Run `electron-builder build --mac` to build the macOS installer
- Run `electron-builder build --win` to build the Windows installer
- Run `electron-builder build --linux` to build the Linux installer

Installers will be generated in the `dist` folder.

## Known Issues

- The github action that's supposed to build the installers, builds a broken `.dmg` file, due to it not being signed.

### GitHub Action

The action triggers on a new tag created with the format `v*.*.*`. It will build the installers and upload them as release assets.

```
git tag v1.0.0  # Create a new tag
git push origin v1.0.0  # Push the tag to GitHub
```
