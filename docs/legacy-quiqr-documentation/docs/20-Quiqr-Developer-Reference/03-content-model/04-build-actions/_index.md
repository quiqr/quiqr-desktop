---
weight: 40
title: Build Actions
#bookCollapseSection: true
---

# Build Actions

Build actions are custom actions which are triggered by a user clicking the action
button. Build actions can be attached to a [Single](/docs/20-quiqr-developer-reference/03-content-model/02-model-file-structure/01-root-properties/05-singles/)
or a [Collection](/docs/20-quiqr-developer-reference/03-content-model/02-model-file-structure/01-root-properties/06-collections/) object.

A build action allows the user to use data stored in a Quiqr site object as
input for an external program. The value that the external program returns can
be displayed, or, if it is a filename, the user can open it.

A typical use case for a build action would a PDF builds. Using [Pandoc](https://pandoc.org/)
or [Quarto](https://quarto.org/) a markdown file could be converted to a nicely
formatted PDF file.

## Variables

Before a build action is executed variables will be replaced by a their real
values. There are standard Quiqr site variables like `SITE_PATH` and there
are custom declared variables. The custom declared variables can be overruled
in the [global variable
preferences](/docs/20-quiqr-developer-reference/30-global-preferences/20-variables/)
of the installed Quiqr application.

A `%` symbol needs to be written before a variable name in the definition to
let Quiqr know it should be replaced with the real value.

Available standard quiqr site variables:

- SITE_PATH: Is replaced with the root folder of the site. E.g. `/Users/pim/Quiqr/sites/my-documents`.
- DOCUMENT_PATH: Is replaced with the path of the file which opened by the user. E.g. `/Users/pim/Quiqr/sites/my-documents/content/quotations/001-johnson.md`.

## Properties

These are the properties of one build action.

| property                              | value type              | optional   | description                                                                                                                                                                                  |
|:--------------------------------------|:------------------------|:-----------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| key                                   | string                  | mandatory  | Keys are for internal use and must be unique.                                                                                                                                                |
| button_text                           | string                  | mandatory  | Text displayed on the button.                                                                                                                                                                |
| execute                               | dictionary              | mandatory  | Contains different settings to define the external program dispatch.                                                                                                                         |
| execute.variables                     | array with dictionaries | optional   | Array with key value pairs containing variable name and their values. If they are used in the `command` or `args` strings. they serve as default values. See example below.                  |
| execute.stdout_type                   | string                  | optional   | The stdout_type can be set to `file_path` or `ascii_message` or `message`.                                                                                                                   |
| execute.unix                          | dictionary              | mandatory  | Contains command and arguments to run on Linux and macOS systems.                                                                                                                            |
| execute.unix.command                  | string                  | mandatory  | File path to the executable to run. Be aware to enter full paths as Quiqr has no PATH variable set. Variables are replaced before execution.                                                 |
| execute.unix.args                     | array of strings        | optional   | All arguments used by the executable. Variables are replaced before execution.                                                                                                               |
| execute.unix.file_path_replace        | array of dictionaries   | optional   | Array with key value pairs containing search and replace strings for the returned file_path. This is introduced to remap the Windows WSL map to Windows Native file path. See example below. |
| execute.unix.document_path_replace    | array of dictionaries   | optional   | Array with key value pairs containing search and replace strings for the document_path. See example below.                                                                                   |
| execute.unix.site_path_replace        | array of dictionaries   | optional   | Array with key value pairs containing search and replace strings for the site_path.                                                                                                          |
| execute.windows                       | dictionary              | optional   | Contains command and arguments to run on Linux and macOS systems.                                                                                                                            |
| execute.windows.command               | string                  | mandatory  | File path to the executable to run. Be aware to enter full paths as Quiqr has no PATH variable set. Variables are replaced before execution.                                                 |
| execute.windows.args                  | array of strings        | optional   | All arguments used by the executable. Variables are replaced before execution.                                                                                                               |
| execute.windows.file_path_replace     | array of dictionaries   | optional   | Array with key value pairs containing search and replace strings for the returned file_path. This is introduced to remap the Windows WSL map to Windows Native file path. See example below. |
| execute.windows.document_path_replace | array of dictionaries   | optional   | Array with key value pairs containing search and replace strings for the document_path. See example below.                                                                                   |
| execute.windows.site_path_replace     | array of dictionaries   | optional   | Array with key value pairs containing search and replace strings for the site_path.                                                                                                          |

### stdout_type's

- *value = file_path* - When set to `file_path` a link to open the result file is displayed after the build action was finished succesfully.
- *value = message* - When set to `message` the return value is displayed after the build action was finished succesfully.
- *value = ascii_message* - When set to `ascii_message` the return value is displayed after the build action was finished succesfully. A fixed font is used to maintain correct layout.


## Full example of a collection object.

### Configuration

{{< code-toggle file="./quiqr/model/includes/collections/quotation" >}}
key: quotations
title: 'Quotations'
extension: md
itemtitle: Quotation
folder: content/quotations
hidePreviewIcon: true
dataformat: yml
fields:
  - key: client
    type: pull
    groupdata: true
    fields:
      - key: company_name
        type: string
      - key: contact_person
        type: string
  - key: date
    type: string
  - key: mainContent
    title: Main Content
    type: markdown
build_actions:
  - key: magic_simple_pdf
    button_text: Build PDF
    execute:
      variables:
        - name: PANDOC_EXECUTABLE
        - value: /usr/bin/pandoc
      stdout_type: message
      unix:
        command: '%PANDOC_EXECUTABLE'
        args: [ '%DOCUMENT_PATH', '-t', 'pdf']
      windows:
        command: 'wsl'
        args: ['pandoc.exe', '%DOCUMENT_PATH', '-t', 'pdf']
  - key: magic_make_pdf
    button_text: Build PDF
    execute:
      variables:
        - name: "NIX_EXEC"
          value: /usr/bin/nix
      stdout_type: file_path
      unix:
        command: '%NIX_EXEC'
        args: [ 'run','github:wearetechnative/quarto-with-batteries#quarto-for-quiqr', '--', '%DOCUMENT_PATH']
      windows:
        command: 'wsl'
        args: ['--distribution', 'nixos', '/run/current-system/sw/bin/nix', 'run', '--extra-experimental-features', 'nix-command flakes', 'github:wearetechnative/quarto-with-batteries#quarto-for-quiqr', '--', '%DOCUMENT_PATH']

        # Converts windows path to unix path for WSL linux
        document_path_replace:
          - search: "\\\\\\\\"
            replace: "\\\\/"
          - search: "C:"
            replace: "/mnt/c"

        # Converts unix path for WSL linux to Windows path
        file_path_replace:
          - search: /mnt/c
            replace: "C:"
key: sample_field
type: empty-line
amount: 2
{{< /code-toggle >}}






