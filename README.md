<p align="center">
    <a href="https://quiqr.org">
    <img width="300" alt="horz - dark" src="https://raw.githubusercontent.com/quiqr/quiqr.org/main/static/images/logo/logo-nav.svg">
    </a>
</p>

<p align="center">
  <a href="https://quiqr.org">Website</a> ·
  <a href="https://discord.gg/nJ2JH7jvmV">Discord</a>
</p>

# Quiqr Desktop NG (Next Generation)

Quiqr Desktop NG is a major upgrade of the Quiqr source code including:

- Electron updates
- React updates
- MUI updates
- migrate to Vite
- and many more updates

This `ng`-branch will replace the current `main` which we will rename to `legacy` ASAP.

## Open Source & Contributing

Quiqr is open source and we appreciate contributions and positive feedback.

## Support and Questions

Please don't hesitate to reach out via [Discord](https://discord.gg/nJ2JH7jvmV).

## Community Guidelines

At a high level, we ask everyone be respectful and empathetic. We follow the [Github Community Guidelines](https://docs.github.com/en/github/site-policy/github-community-guidelines):

* Be welcoming and open-minded
* Respect each other
* Communicate with empathy
* Be clear and stay on topic

## Known Issues

- The github action that's supposed to build the installers, builds a broken `.dmg` file, due to it not being signed.

## Development

### Running Locally

1. Clone the repository
2. Run `npm install` to install the dependencies
3. Run `npm run _pack_embgit` to get the lightweight embedded git client
4. You may or may not need to run `npm run build` in the `frontend` folder to build the frontend.
5. Run `npm run dev` to start the development server and the Electron app
6. React app will be running on [http://localhost:4002](http://localhost:5173)

> [!TIP]
> You can also run the backend without electron. It will just start the API:
> `npm run dev:backend:standalone`
> `npm run dev:frontend`
> Visit http://localhost:4002 in your browser.
> If you use Firefox you might run into CORS issues.

### Building the Installers

1. Run `npm run build` to build the installers
2. The installers will be generated in the `dist` folder

### (Optional) Manual builds

- Run `electron-builder build --mac` to build the macOS installer
- Run `electron-builder build --win` to build the Windows installer
- Run `electron-builder build --linux` to build the Linux installer

Installers will be generated in the `dist` folder.

### Release Runbook

- Make sure `npm run build` works and generates no warnings
- Update the CHANGELOG
    - set new version
    - set release data
    - add changes
    - if public release
        - add stats (new stars, npm costs, new community templates)
- Update version in [project_root]/package.json
- commit package.json and CHANGELOG.md with -m `release: prepare v[version]`
- `git tag v[version]`
- `git push --tags`
