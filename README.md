# Sugo CMS

A CMS for Hugo to run on your computer. **No hosting fees are required**.

## Features

Take a look at our features and understand why Sukoh is a great tool for your Hugo websites:

* **Runs on your computer.** Supported Platforms: Windows, Linux and macOS.
* **Free for commercial use.** Download our binaries today and use it for your own commercial purposes.
* **One click installer.** It's a breeze to install on your PC.
* **Dozen of ready to use UI components.** Crafted to handle many use cases and complex data hierarchy.
* **Clean UI.** Clearly see what you are doing without any clutter or confusion.
* **Open Source.** MIT license. Copy, edit, share, redistribute.
* **Build User Interfaces Easily.** Just create a small configuration file (JSON, TOML and YAML are supported).

*Some features may be under development.*

## Getting Started

* Download
* Open the application.
* In the home screen, add a new website and choose a Site Source _(at the moment, the only option is the Folder Source)_ and complete the form.

## Basics

You'll have to learn some concepts before diving deep into Sukoh. But don't worry, they are very easy to master.

### Website Configuration File

The website configuration files are stored in your *home/username/Sukoh* folder. It don't not be versioned, but you can if it get complex.
You can have multiple websites registered, each having their own configuration file. _\(e.g. config.website-1.json, config.website-2.json\)_

A minimal website configuration file looks like this:

```json
{
  "name": "Sukoh Website", /* your website friendly name */
  "key": "sukoh-website", /* your website unique key */
  "source": { /* where your website workspaces will come from */
    "type": "folder", /* every source has a type but for now we only have the folder type */
    "path": "D:/Projects/sukoh-website/" /* an absolute path to your website folder */
  },
  "publish": [ /* configurations used to server your workspaces to use with Hugo executable */
    {
      "key": "default",
      "config": {
        "type": "folder",
        "path": "D:\\website-output-path\\"
      }
    }
  ]
}
```

Note that your website configuration can be a JSON, YAML or TOML file.

### Sukoh Configuration File

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
* It should be versioned under the same _version control system_ as your website.
* You can have many workspaces for a single site. When using the Folder Source for your site, you'll have only one workspace called *root*. When using the Git Source (under development), each branch is a workspace.

For a minimal configuration file, see the default workspace configuration (which is auto created when you open a workspace without configuration), slightly changed:

```json
{
  "hugover": "0.63.1",
  "serve":[
    {
      "key":"default",
      "config":"config.toml"
    }
  ],
  "build":[
    {
      "key":"default",
      "config":"config.toml"
    }
  ],
  "collections":[
    {
      "key": "posts", /* a unique key */
      "title": "Posts", /* a friendly title for your menu item */
      "folder": "content/posts/", /* relative path to a list of page bundles */
      "extension": "md", /* md|html|json|toml|yaml */
      "dataformat": "yaml", /* yaml|json|toml */
      "itemtitle": "Post", /* a title for a single item of the collection */
      "fields": /* here you will set up your UI binded to the collection */
      [
        { "type":"info", "content":"# Info\nYou can write custom instructions here." },
        { "key":"title", "title":"Title", "type":"string" },
        { "key":"mainContent", "title":"Content", "type":"markdown" },
        { "key":"pubdate", "title":"Pub Date", "type":"date" },
        { "key":"draft", "title":"Draft", "type":"boolean" },
        { "key":"bundle-manager", "type":"bundle-manager", "path":"imgs", "extensions": ["png","jpg","gif"], "fields":[
            { "key":"title", "title":"Title", "type":"string" },
            { "key":"description", "title":"Description", "type":"string", "multiLine":true }
          ]
        }
      ]
    }
  ],
  "singles":[
    {
      "key": "mainConfig", /* a unique key */
      "title": "Main Config", /* a friendly title for your menu item */
      "file": "config.yaml", /* a relative path to your file. "somePath/yourfilename.(md|html|json|toml|yaml)" */
      "fields":[
        { "key":"title", "title":"Site Title", "type":"string" },
        { "key":"params", "title":"Params", "type":"nest", "fields": [
          //... more fields
        ]}
      ]
    }
  ]
}
```

Note that your workspace configuration can be a JSON, YAML or TOML file.

### Fields

Collections and singles configurations have a property named "fields" where you must provide an array of field configurations.

Each field must use one of the available Sukoh components by setting a "type" property. The current types list is below:

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

Some components have a "field" or "fields" property, allowing for nesting and composition.

To see the components in action, you can access our [Forms Cookbook](http://formscookbook.sukoh.io.s3-website-us-east-1.amazonaws.com/). For quick reference. _\(the Forms Cookbook is also included in the desktop app.\)_

You can also refer to the source code to see all available properties for each component type.

## Global configuration

### More Concepts

More concepts are yet to come, but with those already given, and by looking into the Forms Cookbook, you should now be ready to use Sukoh CMS.

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

```git clone https://github.com/julianoappelklein/sukoh.git && cd sukoh```

Install NPM dependencies and build:

```npm install && npm run _rebuild-native && npm run dist-linux```


### Building on macOS

Install the required tools:

```
brew install npm
```

Clone the repository and set the current directory to the root:

```git clone https://github.com/julianoappelklein/sukoh.git && cd sukoh```

Install NPM dependencies and build:

```npm install && npm run _rebuild-native && npm run dist-mac```

## Vision

The desired workflow for Sukoh is:

* Someone installs Sukoh and opens it.
* A list of existent Hugo website templates ("Sukoh-ready") are listed for selection.
* The user select the desired template and the website is downloaded.
* Right from the start, the user can create posts without hassle.
* The user selects a way to version the content and a place to publish it, just providing minimal configurations.

## Development Stack

* Node JS
* Electron
* React (using create-react-app)
* Material UI for React JS
* Flow
