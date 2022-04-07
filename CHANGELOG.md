# Quiqr App CHANGELOG

# **WORK IN PROGRESS**
- new type: font-picker
- new type: image-select
- improve image layout
- upgraded electron from 5 to 9
- remove redundant openFileDialog code
- unsubscribe from listeners in App.js

## 0.10.1 (2022-03-31)
- code cleanup

## 0.10.0 (2022-03-31)

- implement preferences with choosable Data Folder
- many fixes in bundle-manager
- new bundle-manager attribute: forceFileName
- new bundle-manager attribute: maxItems
- new bundle-manager feature to write to path relative to site dir

## 0.9.5-4 (2022-03-17)
- fix mac build

## 0.9.5-3 (2022-03-17)
- enable flatpak

## 0.9.5-2 (2022-03-17)
- enable more linux formats

## 0.9.5-1 (2022-03-17)
- enable more linux formats

## 0.9.5-0 (2022-03-17)
- todo

## 0.9.4 (2022-03-16)
- todo

## 0.9.3 (2022-03-16)
- todo

## 0.9.2 (2022-03-16)
- fork from PoppyGo App

## v0.9.1
- todo ...

## v0.9.0
- todo ...

## v0.8.3
- fix upgrade race conditions on windows

## v0.8.2
- new embgit to fix openssh keys on mac

## v0.8.1
- all subscription stuff

## v0.7.5
- static imagebundles
- image thumb sizes smaller
- small styling improvements
- updated sukoh generator
- homescreen improved with themes overview

## v0.7.4
- fix accordion

## v0.7.2

- detect if hugo server is running or not
- show not running server in preview window
- improve restart of hugo server
- autoimport by clicking link in browser for Windows & Linux (quiqr://)

## v0.7.1

- auto generate menu
- experimental menu

## v0.7.0

- become a Quiqr member
- claim a Quiqr domain
- new authentication flow for publishing sites

## v0.6.6

- fix image previews in Singles
- improve bundle-manager and image thumb layout
- open single item in editor
- open collection item in editor
- don't bother users with valid keys, let them enter titles and auto generate key
- delete directory too when deleting a pageBundle
- open entry after creation collections
- imrove texts in dialogs when publishing
- improve preview user interface
- remove markdown preview
- welcome screen
- refresh sites after import
- move to expert: version switcher
- auto open preview url
- add "previewUrl" property to singles
- back button in collections breadcrum
- preview icons in page editor
- improve sidebar menu

## v0.6.5
- new feature: version switcher

## v0.6.4
- fix open last site ad startup
- close app on last window closed (macos)
- fix delete site action

## v0.6.3
- more fixes unstable select site task
- add spectron e2e framework

## v0.6.2

- fix unstable select site task
- fix hugo not starting after returning to quiqr

## v0.6.1
- fix embgit.exe location on Windows
- show version in help menu on Windows

## v0.6.0
- Official Windows support
- Fix Windows installer
- Fix hugo server running on Windows

## v0.5.5
- new confkey for collections: sortkey
- interface in collection listing to sort values

## v0.5.4
- hide previewwindow when video's are played full screen
- position previewwindow correctly when app is fullscreen

## v0.5.3
- soft close mobile preview window in multiple situations where needed
- reopen mobile preview when softclosed

## v0.5.2
- specific help links
- close mobile preview window in multiple situations where needed

## v0.5.1
- [site-source]/quiqr/home/index.md is displayed on the site dashboard

## v0.5.0

- fix progress windows not closing bug
- fix double click pogofile error when quiqr not running
- first working version of the poppy:// handler

## v0.4.5
- fix scss bug

## v0.4.4

- refactored pogopublish, impl.commit -a
- disable gitlab-ci
- remove resources add export

## v0.4.2 [05.06.20 03.03]
- Fix unknown host problem ssh/git

- Upgrade to from electron 3.x to 5.x
- Fix strange browserview HTML behaviour
- Stop server is not defined

## v0.4.1 [04.06.20 20:59]
- Menu rewrote, disable items when no site selected
- Export config with private key as .pogopass-file

## v0.4.0 [04.06.20 03:22]
- mobile browser,
- import/export theme's,
- double click pogosite files opens the app and starts importing,
- double click pogotheme files opens the app and starts importing,
- select site no popup anymore,
- no need to restart the app after site import, or site deletion,
- open site directoty in expert-menu,
- open site config in expert-menu
- help-menu opens https://docs.quiqr.app/

## versie 0.3.5 - Private Beta 3
- cleanup export file (ignore .git and public)

## versie 0.3.4 - Private Beta 2
- embgit fixes

## versie 0.3.2 - Private Beta 1
- quiqr publisher
- custom menu slots
- interface cleanups
- progress windows

## versie 0.3.0 - Birth Poppy Go
- new icon
- new product name
- remember window size
- direct start of server after site switch
- gitlab publisher now uses embgit (https://github.com/mipmip/embgit)

## versie 0.2.5 - Lize
- github publisher now uses embgit (https://github.com/mipmip/embgit)

## versie 0.2.4
- afbeeldingen mogelijk maken in singles
- standaard hugo versie bij nieuwe site 0.66.0

## versie de sukoh 0.2.3 - Andreas
- geen zip extensie
- probleem met starten
- betere afhandeling site naam import export
- methode om te herstarten
- delete site files
- meer feedback na importeren
- meer feedback na exporten
- pas site key aan

## versie de sukoh 0.2.2 - Andreas

- code signature
- git publisher gebaseerd op key
- meer feedback na publiceren
- versie van hokus duidelijk weergeven
- embed gitkeys
- git
- betere bestandsstructuur

## versie de sukoh 0.2.1 - Andreas
- rename to sokuh
- start met versioning

## versie de downward spiral 0.1 - Laurens

## Hokus
- start
  - readSettings
  - when theme found copy to css
  - else copy default
  - voorkeuren voor kleuren (ik word gek van paars en blauw)
- onfig.json
  - niet gemaximaliseerd starten
  - hide extra menu
- meer stylen als een native programma
- downward-spiral pims/lingewoud branch met alle pr-merged
- tekstmenu voor minder belangrijke zaken
  - hoe ziet het op Linux en Windows eruit
  - hugo console
    - nieuw window
  - configuratie
- start server
- publish
- link om lokaal website te openen
- windows binary
- windows binary ftp
- site testen op windows
- windows binary uploaden github

## Rusland 1 sessie
- fix image upload
- editorconfig
- maak page bundle
- select site, direct vanuit het menu
