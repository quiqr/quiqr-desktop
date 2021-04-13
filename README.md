# PoppyGo App

PoppyGo App is a CMS and Publishing tool for Hugo to run on your computer.

## Features

Take a look at our features and understand why PoppyGo is a great tool for your
Hugo websites:

* **Runs on your computer.** Supported Platforms: Windows, Linux and macOS.
* **Free for commercial use.** Download our binaries today and use it for your own commercial purposes.
* **One click installer.** It's a breeze to install on your PC.
* **Dozen of ready to use UI components.** Crafted to handle many use cases and complex data hierarchy.
* **Clean UI.** Clearly see what you are doing without any clutter or confusion.
* **Open Source.** MIT license. Copy, edit, share, redistribute.
* **Build User Interfaces Easily.** Just create a small configuration file (JSON, TOML and YAML are supported).

## Getting Started

* Download
* Open the application.
* In the home screen, add a new website and choose a Site Source _(at the moment, the only option is the Folder Source)_ and complete the form.

## Basics

You'll have to learn some concepts before diving deep into PoppyGo site
development. Read the quickstart or the [PoppyGo
Book](https://poppygo.github.io/poppygo-book/) for full reference of the
PoppyGo App and the PoppyGo Platform.

### Website Configuration File

The website configuration files are stored in your *home/username/Sukoh* folder.

### PoppyGo App Configuration File

An optional configuration file can be stored in your *home/username/Sukoh*
folder. When *config.json* is found sukoh will read the settings at startup.

It looks like this:

```json
{
  "debugEnabled": true,
  "cookbookEnabled": true,
  "siteManagementEnabled": true,
  "maximizeAtStart": false,
  "hideWindowFrame": false,
  "hideMenuBar": false,
  "appTheme": "simple"
}
```

### Workspace Configuration File

All the UI configurations and bindings are set in the workspace configuration file.

Keep in mind:

* The workspace configuration file must be placed at the root of your Hugo website.

For a minimal configuration file, see the default workspace configuration.

Note that your workspace configuration can be a JSON, YAML or TOML file.

### Fields

Collections and singles configurations have a property named "fields" where you
must provide an array of field configurations.

Each field must use one of the available PoppyGo components by setting a "type"
property. The current types list is below:

* accordion
* boolean
* bundle-manager
* chips
* code-editor
* date
* leaf-array
* hidden
* markdown
* nest
* number
* readonly
* section
* select
* string

Some components have a "field" or "fields" property, allowing for nesting and
composition.

To see the components in action, you can access our [Forms
Cookbook](http://formscookbook.hokus.io.s3-website-us-east-1.amazonaws.com/).
For quick reference. _\(the Forms Cookbook is also included in the desktop
app.\)_

You can also refer to the source code to see all available properties for each
component type.

## Global configuration

### More Concepts

More concepts are yet to come, but with those already given, and by looking
into the Forms Cookbook, you should now be ready to use PoppyGo CMS.

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

```git clone https://github.com/poppygo/poppygo-app.git && cd sukoh```

Install NPM dependencies and build:

```npm install && npm run _rebuild-native && npm run dist-mac```

## Vision

The desired workflow for PoppyGo is:

* Someone installs PoppyGo and opens it.
* A list of existing Hugo website templates ("PoppyGo-ready") are listed for
  selection.
* The user select the desired template and the website is downloaded.
* Right from the start, the user can create posts without hassle.
* The user selects a way to version the content and a place to publish it, just
  providing minimal configurations.

## Development Stack

* Node JS
* Electron
* React
* Material UI for React JS
* Go
