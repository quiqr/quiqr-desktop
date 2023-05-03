# Quiqr App CHANGELOG
## **WORK IN PROGRESS**
- feature: improve git debugging
- feature: add troubleshooting menu item
- feature: move all config to site folder
- feature: new default data folder `Quiqr`
- feature: app-ui-style is now a preference
- feature: queryselect with keys in file (e.g. .weekdays[] in calendar.json)
- feature: queryselect using Autosuggest
- feature: add images directly from imageselect dialog
- cleanup: refactored cli execute
- cleanup: remove death quiqr-cloud code
- cleanup: remove rimraf
- cleanup: remove death modules
- cleanup: remove field ArrayList
- cleanup: removed RaisedButtons from mui-02
- fix: select-image broke with non-image files
- fix: #314 & #181 breadcrumb in collections  cannot go back to root document
- fix: #422 renaming collection items do not allow extensions in new name
- fix: no "make page bundle" for non-markdown-collections

## 0.16.0 (2023-04-24)
- feature: add back button in prefs toolbar
- feature: new field-type: select-from-query
- feature: first proof of concept of the new Quiqr Query Language
- feature: bundle-manager, show add-button on top of the widget
- cleanup: text menu
- cleanup: remove quiqr cloud stuff
- cleanup: remove form cookbook
- breaking changes: new vars format in custom open-in command (%site_name, %site_path)
- fix: #410, show active toolbar
- fix: missing active publish conf in sidebar

### Stats
- 34 stars
- 5 community templates
- 37 NPM modules - 35.11M

## 0.15.2 (2023-01-24)
- fix: application did not start

## 0.15.1 (2023-01-24)
- chore: update electron-builder to fix macos builds

## 0.15.0 (2023-01-24)
- fix: remove mobilePreviewCode
- fix: improve side menu layout
- fix: improve site name validations in library
- feature: hidePreviewIcon for singles and collections
- feature: hideExternalEditIcon for singles and collections
- feature: hideSaveButton for singles
- feature: previewUrlBase for collections
- feature: make site menus collapsable/expandable
- feature: copy site from Library
- feature: copy collection item
- fix: improve rename collection backend function
- fix: image welcomescreen
- feature: experimental setting: new improved sync method
  This prevents stale copies of files which are removed on the other side
- 96 material-02 components import left to port to MUI 4

### Stats
- 27 stars
- 5 community templates
- 37 NPM modules - 35.11M

## 0.14.5 (2022-12-06)
- fix bug in pull sync when repo does not exist
- always use --disableFastRender

## 0.14.4 (2022-12-06)
- removed hugo versions from git workflow to make it succeed more often

## 0.14.3 (2022-12-06)
- private github repos can be imported using private key
- selective sync

## 0.14.2 (2022-10-20)
- enable all matrix platform builds with fail-fast=false

## 0.14.1 (2022-10-19)
- macos build

## 0.14.0 (2022-10-19)
- fix undefined callback function
- implement rough sync from functionality for folder targets
- implement rough sync from functionality for git targets

## 0.13.12 (2022-10-19)
- fix build

## 0.13.11 (2022-10-19)
- update to node 16 in github action

## 0.13.10 (2022-10-19)
- update to node 16 in github action

## 0.13.9 (2022-10-19)
- Implement Custom Open Command (e.g. tmux send-keys 'cd "%s"' Enter)
- Fix help links
- Fix toolbar in Preference Window
- Add concept of option to show/hide menu bar
- Support subdir as baseURL for preview

## 0.13.8 (2022-07-08)
- try fix Windows embgit

## 0.13.7 (2022-07-08)
- try fix Windows embgit

## 0.13.6 (2022-07-01)
- try fix npm packages package-lock.json

## 0.13.5 (2022-07-01)
- try fix npm packages

## 0.13.4 (2022-06-30)
- fix unused var

## 0.13.3 (2022-06-30)
- small bugfixes
- add quickstart video endpoint
- try enable linux build target

## 0.13.2 (2022-06-29)
- set cname for github pages
- sort tags
- Quiqr Community Templates listing
- show active toolbar item in workspace
- move role to edit below preferences
- role has effect on toolbar and content dashboard
- show content items on dashboard
- fix #412 read and save md without frontmatter
- add new collection propery includeSubDirs default true

## 0.13.1 (2022-06-23)
- lint fixes

## 0.13.0 (2022-06-23)
- wip: open in quiqr (quiqr://)
- reorganized site dev tools
- new welcome screen
- new/import site from folder
- remove old create site
- new site from scratch
- simplified text-menu
- log to console main-api request timeouts
- minimal windows sizes

## 0.12.0 (2022-06-14)
- add Hugo Version select in new site
- show last used publish conf
- add timeout on embgit show repo
- add sync-to-folder target

## 0.11.4 (2022-06-14)
- fix problem in react-scripts

## 0.11.3 (2022-06-14)
- show mousefeedback when clicking card in Library
- fix react errors and depreciations
- fix problem preventing starting on a mac

## 0.11.2 (2022-06-13)

- fix empty page in library after startup
- fix production

## 0.11.1 (2022-06-13)
- fix missing resources/all dir for buildinfo.js

## 0.11.0 (2022-06-13)
- add disable model cache option
- dynamics can now be defined in model/includes/
- implement mergePartials in dynamics, refactor initial config provider
- save accordion state with dynamic fields
- autoSave for all relevant field types
- hideIndex for collection
- accordion dynamic reload fixes
- use key for title when not set
- update license
- fix relative paths for bundle-image-mananager and image-select
- add bugfixes to single
- fix cookbook
- big ux refactor
- refactor site config, add open in editor
- add top toolbar right
- renamed publish to sync
- seperate component for publish
- fix routings
- implemented site tags
- remember site library state
- cleanup remote content menu in publish
- edit tags is working
- add site rename dialog
- UI improvements
- new role selectionmenu
- implement roles in sidebar menu
- first version cards listing
- autogenerate etalage screenshot
- implemented favicon detection and display
- first work on the new sync sidebarmenu
- add publish github
- show GH card
- edit configuration
- start with quiqr cloud form
- github sync, WIP almost finisged
- import from git
- fix embgit name
- refactor, almost finsished import git url
- add lint to servemain
- upgrade react-script to align eslint versions
- fix 4 dependabot security issues
- implemented new site from hugo theme

## 0.10.4 (2022-04-14)
- only mac build

## 0.10.3 (2022-04-14)
- BREAKING: change mergeFromPartial to mergePartial
- concept: add file:// URI protocol possibility to partial
- show read only quiqr-model parse information
- move post-requests to src-main
- improve quiqrcloud plan:
  - delete form cloud
  - unsubscribe plan
  - move all actions to dialog
  - chain check delete actions

## 0.10.2 (2022-04-09)
- new type: font-picker
- new type: image-select
- show read only site configuration
- improve image layout
- upgraded electron from 5 to 9
- remove redundant openFileDialog code
- unsubscribe from listeners in App.js
- auto compile (inotify) site-root/quiqr/model/base.yml

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
- config.json
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
