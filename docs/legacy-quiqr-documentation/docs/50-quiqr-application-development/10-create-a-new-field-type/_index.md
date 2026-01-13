---
title: Create a new field type
weight: 10
---

# Create new a new field type

This HowTo teaches you how to create a new custom field type.

## Introduction

Quiqr Field Types are the user interface to data that is stored in the website.

## Steps

### copy an existing field type

copy an existing field type that you like to use as template.

The field types are stored in the path ```src/components/SukohForm/components/```

They are named FieldNameDynamic.js where FieldName is the name you want to use.

```
cp src/components/SukohForm/components/SelectDynamic.js src/components/SukohForm/components/FontPickerDynamic.js
```

### Replace OldFieldName with NewFieldName

Open your new file and replace the OldFieldName with new NewFieldName.

Also set a new field type in the method:

```javascript

getType(){
    return 'new-field-name';
```

This is used in `site/quiqr/model/base.yaml`

### Import and export the type class

In the file `src/components/SukohForm/components/all.js` the new type class
should be imported and exported.

```
...
import FontPickerDynamic from './FontPickerDynamic';
...

export default [
    ...
    FontPickerDynamic,
    ...
]

```

### Implement your own type code

At this point you should implement your own code. It's wise to test the new
type in a demo website while you implement the new type. Take small steps.
