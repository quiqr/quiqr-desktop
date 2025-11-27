# Quiqr Desktop NG (Next Generation)

Quiqr Desktop NG is a major upgrade of the Quiqr source code including:

- Electron updates
- React updates
- MUI updates
- migrate to Vite
- and many more updates

This `ng`-branch will replace the current `main` which we will rename to `legacy` ASAP.

## Running Locally

1. Clone the repository
2. Run `npm install` to install the dependencies
3. You may need to run `npm run build` in the `frontend` folder to build the frontend.
4. Run `npm run dev` to start the development server and the Electron app
5. React app will be running on [http://localhost:4002](http://localhost:5173)

> [!TIP]
> You can also run the backend without electron. It will just start the API:  
> `npm run dev:backend:standalone`  
> `npm run dev:frontend`  
> Visit http://localhost:4002 in your browser. 
> If you use Firefox you might run into CORS issues.


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
