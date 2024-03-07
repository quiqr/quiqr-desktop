<p align="center">
    <a href="https://quiqr.org">
    <img width="600" alt="horz - dark" src="https://raw.githubusercontent.com/quiqr/quiqr.org/main/static/images/logo/logo-nav.svg">
    </a>
</p>

<p align="center">
  <a href="https://quiqr.org">Website</a>
  ·
  <a href="https://book.quiqr.org/docs/10-getting-started/01.installation/">Install</a>
  ·
  <a href="https://book.quiqr.org">Documentation</a>
</p>

## About

Quiqr is a open source, cross platform, offline
desktop CMS for Hugo with build in Git functionality for deploying static
sites to any hosting server. Read all about it Quiqr at our [website](<https://quiqr.org>).


## Supported Platforms

Quiqr runs on Windows, macOS and Linux

## Installation

You can download Quiqr Desktop from our [website](<https://quiqr.org>).

## Changelog and Releases

We try to release an often. See our [changelog (release notes).](https://github.com/quiqr/quiqr-desktop/blob/main/CHANGELOG.md)

## Issues, Bugs, and Feature Requests

File issue requests [in this repo!](https://github.com/quiqr/quiqr-desktop/issues/new/choose)

<!--We kindly ask that you please use our issue templates to make the issues easier to track for our team.-->

## Open Source & Contributing

Quiqr is open source and we appreciate contributions and positive feedback.

## Support and Questions

<!--

1. See our [docs](https://docs.warp.dev/help/known-issues) for a walkthrough of the features within our app.
2. Join our [Discord](https://discord.gg/warpdotdev) to chat with other users and get immediate help with members of the Warp team.

-->

Please don't hesitate to reach out via email at info at quiqr dot org.

## Community Guidelines

At a high level, we ask everyone be respectful and empathetic. We follow the
[Github Community Guidelines](https://docs.github.com/en/github/site-policy/github-community-guidelines):

* Be welcoming and open-minded
* Respect each other
* Communicate with empathy
* Be clear and stay on topic

## Open Source Dependencies

We'd like to call out a few of the [open source
dependencies](https://github.com/quiqr/quiqr-desktop/blob/main/ThirdPartyNotices.txt)
that have helped Quiqr to get off the ground:

* [Hugo](https://gohugo.io/)
* [ElectronJS](https://www.electronjs.org/)
* [React](https://reactjs.org/)
* [MUI](https://mui.com/)


## Building

###  Preparing on Windows

* Install the required tools:
  * [Git (optional)](https://nodejs.org/en/download/)
  * [Node + NPM](https://nodejs.org/en/download/)
  * [Visual Studio 2017 (c++ tools)](//docs.microsoft.com/pt-br/visualstudio/)

###  Preparing on Linux

Install the required tools:

```
sudo apt-get install nodejs
sudo apt-get install npm
sudo apt-get install git-core
sudo apt-get install libssl-dev
```

### Preparing macOS

Install the required tools:

```
brew install npm
```

### Building

* Clone or download the source code.

```
git clone https://github.com/quiqr/quiqr-desktop.git && cd quiqr-app
```

* Open the terminal in the project's root directory.
* Run

```
npm install && npm run dist
```

## Development

Clone the repository.

```
git clone https://github.com/quiqr/quiqr-desktop.git && cd quiqr-app
```

Install npm dependancies.

```
npm install
```

Get latest embgit

```
npm run _pack_embgit
```

Start electron with a single command.

```
npm run start
```

Alternatively you can start two seperate nix-shell terminal (e.g. with tmux),
one for the backend...

```
npm run _electron-dev
```

... and one for the frontend.

```
npm run _react-dev
```

### Development with devtools window

```
DEVTOOLS=1 npm run _electron-dev
```

### Development Environment on Nix / NixOS

Clone the repository..

```
git clone https://github.com/quiqr/quiqr-desktop.git && cd quiqr-app
```

Make sure flakes are enabled.

Enter the nix-shell..

```
nix develop

[nix-shell:~/quiqr-app]$
```

Install npm dependancies..

```
npm install
```

Get latest embgit..

```
npm run _pack_embgit
```

Start electron with a single command.

```
npm run start
```

### Stack

* Electron
* React + MUI
* Go

### Release Runbook

**1. Update Hugo version list..**

```
npm run _hugo_versions
```

**2 Gather stats for changelog..**

- count templates in gallery
- github stars
- npm module costs (see here below)

```
npx cost-of-modules --no-install
```

**3. Update and commit last changes..**

**4. Release**..

```
npm run release
```

**5. Check GitHub actions..**

**6. Create release on github from tag**
