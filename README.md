<p align="center">
    <a href="https://quiqr.org">
    <img width="300" alt="horz - dark" src="https://raw.githubusercontent.com/quiqr/quiqr.org/main/static/images/logo/logo-nav.svg">
    </a>
</p>

<p align="center">
  <a href="https://quiqr.org">Website</a> ·
  <a href="https://quiqr.github.io/quiqr-desktop/docs">Documentation</a> ·
  <a href="https://discord.gg/nJ2JH7jvmV">Discord</a> ·
  <a href="https://quiqr.github.io/quiqr-desktop/specs">OpenSpec UI</a>
</p>

<p align="center">
  <a href="https://github.com/quiqr/quiqr-desktop/actions/workflows/deploy.yml">
    <img src="https://github.com/quiqr/quiqr-desktop/actions/workflows/deploy.yml/badge.svg?branch=main" alt="Deploy Status">
  </a>
  <a href="https://github.com/quiqr/quiqr-desktop/actions">
    <img src="https://quiqr.github.io/quiqr-desktop/badges/coverage.svg" alt="Coverage">
  </a>
  <a href="https://github.com/quiqr/quiqr-desktop/releases">
    <img src="https://img.shields.io/github/v/release/quiqr/quiqr-desktop?label=version" alt="Version">
  </a>
  <a href="https://github.com/quiqr/quiqr-desktop/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  </a>
<!--
  <a href="https://github.com/quiqr/quiqr-desktop/stargazers">
    <img src="https://img.shields.io/github/stars/quiqr/quiqr-desktop?style=social" alt="Stars">
  </a>
  <a href="https://github.com/quiqr/quiqr-desktop/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/quiqr/quiqr-desktop" alt="Contributors">
  </a>
-->
</p>

# Quiqr

Quiqr is a local-first CMS, available as a desktop application (Electron) or web
application. It provides fast content management with zero network latency while
keeping your data local for privacy and developer-friendly workflows.

## Key Features

**Local first with max performance**

- **Local-First Architecture**: Data stays on your computer for maximum privacy and speed
- **Built-in Git Client**: Publish directly to GitHub, GitLab, or BitBucket

**Be creative**

- **Multi-SSG Support**: Built for Hugo with expanding support for Quarto, Jekyll, and Eleventy
- **Integrated Hugo Server**: Preview your site changes instantly
- **Generic Builder Support**: Any system working with static serialized data can be integrated.
- **Template Gallery**: Quick-start with pre-built site templates

**Declarative workflows**

- **Schema-Driven Forms**: Powerful, customizable content editing interface
- **Loved by AI Agents**: AI love Markdown, Json and Yaml our Schema-Driven architecture.
- **Advanced Prompt Templating System**: Share and pre-write prompts for harnassing teams.

## Quiqr Editions

The Quiqr application can run in two modes: Desktop Mode (Electron) or Server
Mode (Standalone). 

|                   | Quiqr Desktop | Quiqr Server             |
|------------------:|:--------------|:-------------------------|
|   **Performance** | 🚀            | 🏎️                       |
|    **Multi-user** | ❌            | ✅                       |
| **Fast boarding** | ❌            | ✅                       |
|   **Local First** | ✅            | ❌                       |
|      **Audience** | Developers    | Teams/Non-technical users|

## Use cases

- Static Site CMS (Hugo, Quarto, Eleventy and Jekyll)
- Control Panel for Terraform managed clouds
- CMS for advanced PDF's using Quarto and pandoc
- Shared LLM Prompt libraries

## Support and Questions

Please don't hesitate to reach out via [Discord](https://discord.gg/nJ2JH7jvmV).

## Community Guidelines

Quiqr is open source and we appreciate contributions and positive feedback.

* Be welcoming and open-minded
* Communicate with empathy
* Be clear and stay on topic

For detailed information about contributing to this project, including PR
requirements, testing guidelines, and the OpenSpec workflow, please see
[CONTRIBUTING.md](./CONTRIBUTING.md).

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

### Releasing

For information about the release process, versioning policy, and release
procedures, see [RELEASE.md](./RELEASE.md).


## About the Quiqr Project

### Maintainers

- [mipmip](https://github.com/mipmip)
- [bert-janzwanepol](https://github.com/bert-janzwanepol)

<h2 align="center">Supporters</h2>
<p align="center">
    <a href="https://technative.eu">
        <img width="300" alt="horz - dark" src="https://raw.githubusercontent.com/wearetechnative/technative-agent-factbook/refs/heads/main/TechNative_logo_colour_RGB.svg" />
    </a>
</p>

### Contributors

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
                <a href="https://github.com/bert-janzwanepol">
                    <img src="https://avatars.githubusercontent.com/u/49754171?v=4" width="100;" alt="bert-janzwanepol"/>
                    <br />
                    <sub><b>Bert-Jan</b></sub>
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
		</tr>
		<tr>
            <td align="center">
                <a href="https://github.com/rpetit3">
                    <img src="https://avatars.githubusercontent.com/u/5334269?v=4" width="100;" alt="rpetit3"/>
                    <br />
                    <sub><b>Robert A. Petit III</b></sub>
                </a>
            </td>
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
