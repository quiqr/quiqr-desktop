<p align="center">
    <a href="https://quiqr.org">
    <img width="300" alt="horz - dark" src="https://raw.githubusercontent.com/quiqr/quiqr.org/main/static/images/logo/logo-nav.svg">
    </a>
</p>

<p align="center">
  <a href="https://quiqr.org">Website</a> ·
  <a href="https://discord.gg/nJ2JH7jvmV">Discord</a>
</p>

<p align="center">
  <a href="https://github.com/mipmip/quiqr-desktop/actions/workflows/test.yml">
    <img src="https://github.com/mipmip/quiqr-desktop/actions/workflows/test.yml/badge.svg?branch=ng" alt="Test Status">
  </a>
  <a href="https://github.com/mipmip/quiqr-desktop/actions">
    <img src="https://mipmip.github.io/quiqr-desktop/badges/coverage.svg" alt="Coverage">
  </a>
</p>

# Quiqr

Quiqr is a local-first CMS for static site generators like Hugo, Quarto,
Jekyll, and Eleventy. Available as a desktop application (Electron) or web
server, it provides fast content management with zero network latency while
keeping your data local for privacy and developer-friendly workflows.

## Key Features

- **Local-First Architecture**: All data stays on your computer for maximum privacy and speed
- **Multi-SSG Support**: Built for Hugo with expanding support for Quarto, Jekyll, and Eleventy
- **Integrated Hugo Server**: Preview your site changes instantly
- **Built-in Git Client**: Publish directly to GitHub, GitLab, or BitBucket
- **Template Gallery**: Quick-start with pre-built site templates
- **Schema-Driven Forms**: Powerful, customizable content editing interface
- **Dual Deployment**: Run as desktop app or standalone web server
- **Modern Stack**: React frontend with Node.js backend for reliability and performance

## NG (Next Generation)

Quiqr Desktop NG is a major upgrade of the Quiqr source code including:

- Electron updates
- React updates
- MUI updates
- Migrate to Vite
- Experimental standalone server mode
- And many more updates

This `ng`-branch will replace the current `main` which we will rename to `legacy` ASAP.

## Quiqr Editions

Though the repository still is named quiqr-desktop, The Quiqr application can
run in two modes: Desktop Mode (Electron) or Server Mode (Standalone). 

### Desktop Mode

Quiqr Desktop runs on your computer. As a desktop application
users gain all advantages of a local first application.

- No latencies, blazingly fast;
- All data is stored on your computer;
- Perfect setup for Site developers as site code changes can be done on the same computer.

### Server Mode 

Quiqr Server allowes Quiqr to be installed as a web application. This allowed
short user boarding times.

- Ideal for sites or applications which have many users;
- Users don't have install Quiqr on their computer, just use the web browser;
- Users don't have to import sites, this can be pre-setup;
- Users don't have to configure synchronizations, this can be pre-setup,

In version 0.21, this setup is experimental and not production ready. 

## Open Source & Contributing

Quiqr is open source and we appreciate contributions and positive feedback.

For detailed information about contributing to this project, including PR requirements, testing guidelines, and the OpenSpec workflow, please see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Support and Questions

Please don't hesitate to reach out via [Discord](https://discord.gg/nJ2JH7jvmV).

## Community Guidelines

At a high level, we ask everyone be respectful and empathetic. We follow the
[Github Community Guidelines](https://docs.github.com/en/github/site-policy/github-community-guidelines):

* Be welcoming and open-minded
* Respect each other
* Communicate with empathy
* Be clear and stay on topic

## Known Issues

- The github action that's supposed to build the installers, builds a broken `.dmg` file, due to it not being signed.

## Development

1. Clone the repository
2. Run `npm install` to install the dependencies
3. Run `npm run _pack_embgit` to get the lightweight embedded git client

### Running the Desktop Mode Application locally

1. Run `npm run dev` to start the development server and the Electron app. The
   app will start and open the frontend automatically.

### Running the Standalone Server Mode Application locally

1. Start a terminal to run the backend with the command: `npm run dev:backend:standalone`
2. Start a terminal to run the frontend with the command: `npm run dev:frontend`
3. Visit http://localhost:4002 in your browser.

### Development on Nix

We provide a local flake for development purposes. Use it like this:

```bash
nix develop
npm install

# Run desktop
npm run dev
```
### Packaging for Nix

Currently there is a WIP packaging fork available at
[https://github.com/mipmip/nixpkgs/tree/quiqr-in-nixpkgs](https://github.com/mipmip/nixpkgs/tree/quiqr-in-nixpkgs). 

You can build and run Quiqr using the following commands:

```bash
git clone https://github.com/mipmip/nixpkgs.git
cd nixpkgs
git checkout quiqr-in-nixpkgs

# Run desktop
nix run .#quiqr.desktop

# Run server
nix run .#quiqr.server
```

### Building the Installers

1. Run `npm run build` to build the installers
2. The installers will be generated in the `dist` folder

### (Optional) Manual builds

- Run `electron-builder build --mac` to build the macOS installer
- Run `electron-builder build --win` to build the Windows installer
- Run `electron-builder build --linux` to build the Linux installer

Installers will be generated in the `dist` folder.

## Releasing

For information about the release process, versioning policy, and release
procedures, see [RELEASE.md](./RELEASE.md).

## Contributors

<!-- readme: contributors -start -->
<table>
	<tbody>
		<tr>
            <td align="center">
                <a href="https://github.com/mipmip">
                    <img src="https://avatars.githubusercontent.com/u/658612?v=4" width="100;" alt="mipmip"/>
                    <br />
                    <sub><b>Pim Snel</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/swanenberg">
                    <img src="https://avatars.githubusercontent.com/u/4381573?v=4" width="100;" alt="swanenberg"/>
                    <br />
                    <sub><b>Brecht Swanenberg</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/julianoappelklein">
                    <img src="https://avatars.githubusercontent.com/u/3170711?v=4" width="100;" alt="julianoappelklein"/>
                    <br />
                    <sub><b>Juliano Appel Klein</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/vsopvsop">
                    <img src="https://avatars.githubusercontent.com/u/5552204?v=4" width="100;" alt="vsopvsop"/>
                    <br />
                    <sub><b>vsopvsop</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/josegonzalez">
                    <img src="https://avatars.githubusercontent.com/u/65675?v=4" width="100;" alt="josegonzalez"/>
                    <br />
                    <sub><b>Jose Diaz-Gonzalez</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/rpetit3">
                    <img src="https://avatars.githubusercontent.com/u/5334269?v=4" width="100;" alt="rpetit3"/>
                    <br />
                    <sub><b>Robert A. Petit III</b></sub>
                </a>
            </td>
		</tr>
		<tr>
            <td align="center">
                <a href="https://github.com/vendhana">
                    <img src="https://avatars.githubusercontent.com/u/1776624?v=4" width="100;" alt="vendhana"/>
                    <br />
                    <sub><b>Vendhan Arumugam</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/gigot-don">
                    <img src="https://avatars.githubusercontent.com/u/183019247?v=4" width="100;" alt="gigot-don"/>
                    <br />
                    <sub><b>gigot-don</b></sub>
                </a>
            </td>
		</tr>
	<tbody>
</table>
<!-- readme: contributors -end -->
