# PoppyGo App

PoppyGo App is a CMS and Publishing tool for Hugo to run on your computer.

## Features

Take a look at our features and understand why PoppyGo is a great tool for your
Hugo websites:

* **Made for Hugo.** PoppyGo is a desktop CMS for Hugo websites.
* **Embedded git.** PoppyGo comes with embedded git functionality for
  publishing and version management.
* **Runs on your computer.** Supported Platforms: Windows, Linux and macOS.
* **Free for commercial use.** Download our binaries today and use it for your
  own commercial purposes.
* **One click installer.** It's a breeze to install on your PC.
* **Dozen of ready to use UI components.** Crafted to handle many use cases and
  complex data hierarchy.
* **Clean UI.** Clearly see what you are doing without any clutter or
  confusion.
* **Open Source.** MIT license. Copy, edit, share, redistribute.
* **Build User Interfaces Easily.** Just create a small configuration file
  (JSON, TOML and YAML are supported).

## Getting Started

* Download
* Open the application.
* Follow the instuctions on the welcome screen.

PoppyGo targets Hugo Website Developers and Hugo Website Content Managers.

### Hugo Website Content Managers

When you are a content manager you can download existing theme's and site
templates. A Hugo Site Developer can give you access to a custom made site.

TODO READ/WATCH the quick start for content managers.

### Hugo Website Developers

You'll have to learn some concepts before diving deep into PoppyGo site
development.

TODO READ/WATCH the quick start for site developers.

Read the [PoppyGo Book](https://poppygo.github.io/poppygo-book/)
for full reference of the PoppyGo App and the PoppyGo Platform.

## Building

###  Building on Windows

* Install the required tools:
  * [Git (optional)](https://nodejs.org/en/download/)
  * [Node + NPM](https://nodejs.org/en/download/)
  * [Visual Studio 2017 (c++ tools)](//docs.microsoft.com/pt-br/visualstudio/)
* Clone or download the source code.
* Open the terminal in the project's root directory.
* Run ```npm install && npm run _rebuild-native && npm run dist-win```

###  Building on Linux

Install the required tools:

```
sudo apt-get install nodejs
sudo apt-get install npm
sudo apt-get install git-core
sudo apt-get install libssl-dev
```

Clone the repository and set the current directory to the root:

```git clone https://github.com/poppygo/poppygo-app.git && cd sukoh```

Install NPM dependencies and build:

```npm install && npm run _rebuild-native && npm run dist-linux```

### Building on macOS

Install the required tools:

```
brew install npm
```

Clone the repository and set the current directory to the root:

```git clone https://github.com/poppygo/poppygo-app.git && cd poppygo-app```

Install NPM dependencies and build:

```npm install && npm run _rebuild-native && npm run dist-mac```

## Development

### Development Environment on Nix / NixOS

Clone the repository.

```git clone https://github.com/poppygo/poppygo-app.git && cd poppygo-app```

Enter the nix-shell

```
nix-shell
[nix-shell:~/poppygo-app]$
```

Install npm dependancies.

```npm install```

Start electron with a single command.

```npm run start```

Alternatively you can start two seperate nix-shell terminal (e.g. with tmux),
one for the backend...

```
nix-shell
npm run _electron-dev
```

... and one for the frontend.

```
nix-shell
npm run _react-dev
```


### Stack

* Node JS
* Electron
* React
* Material UI for React JS
* Go



