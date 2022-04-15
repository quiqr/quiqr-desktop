const joi                    = require('joi');
const path                   = require('path');
const formatProviderResolver = require('./../../utils/format-provider-resolver');

const dataFormatsPiped = formatProviderResolver.allFormatsExt().join('|');

let validationUtils= {
  contentFormatReg: new RegExp('^(md|mmark)$'),
  dataFormatReg: new RegExp('^('+dataFormatsPiped+')$'),
  allFormatsReg: new RegExp('^('+dataFormatsPiped+'|md|mmark)$')
}

class WorkspaceConfigValidator {

  normalizeConfig(config){
    if(config){
      if(!config.collections) config.collections = [];
      if(!config.singles) config.singles = [];
    }
  }

  validate(config){

    this.normalizeConfig(config);

    let validationError = joi.validate(config,
      joi.object().keys({
        hugover: joi.string().trim().required(),
        menu: joi.array(),
        collections: joi.array().required(),
        singles: joi.array().required(),
        dynamics: joi.array(),
        partials: joi.array(), //FOR NOW BACKWARDS COMPATIBITY SOON UNCOMMENT BELOW
        // partials: joi.any().forbidden().error(new Error('the main key partials is obsolete. Use dynamics in stead')),
        build: joi.array().items(joi.object().keys({
          key:joi.string(),
          config:joi.string().required()
        })),
        serve: joi.array().items(joi.object().keys({
          key:joi.string(),
          config:joi.string().required()
        }))
      }).required()
    ).error;

    if(validationError) return validationError.message;

    let validationErrorMessage;

    validationErrorMessage = config.collections.map(x => this.validateCollection(x)).find(x=> x!==null);
    if(validationErrorMessage) return validationErrorMessage;

    validationErrorMessage = config.singles.map(x => this.validateSingle(x)).find(x=> x!==null);
    if(validationErrorMessage) return validationErrorMessage;

    return null;
  }

  checkFieldsKeys(fields, hintPath){
    if(fields==null){ return; }
    let keys = [];
    const error =  `${hintPath}: Each field must have an unique key and the key must be a string.`;
    for(let i = 0; i < fields.length; i ++){
      const field = fields[i];
      const key = field.key;
      if(key==null){
        throw new Error(error+ ` Field without a key is not allowed.`);
      }
      if(typeof(key)!=='string'){
        throw new Error(error+ ' Field key must be a string.');
      }
      else if(keys.indexOf(key)!==-1){
        throw new Error(error+ ` The key "${key}" is duplicated.`);
      }
      else{
        keys.push(key);
        this.checkFieldsKeys(field.fields, `${hintPath} > Field[key=${key}]`);
      }
    }
  }

  validateCollection(collection){

    let validationError = null;

    validationError = joi.validate(collection, joi.object().required().error(new Error('The collection configuration is required.'))).error;
    if(validationError) return validationError.message;

    //validate all fields common to content or data files
    validationError = joi.validate(collection,
      joi.object().keys({
        key: joi.string().trim().regex(/^[A-Za-z0-9\-_]+$/i).min(3).max(90).required().error(new Error('The collection key "'+collection.key+'" is invalid.')),
        title: joi.string().trim().min(3).max(90).required().error(new Error('The title value is invalid.')),
        folder: joi.string().trim().regex(/^(content|data|quiqr).+$/).regex(/^(?!.*[.][.]).*$/).required().error(new Error('The folder value is invalid.')),
        itemtitle: joi.string().trim().min(3).max(90).error(new Error('The itemtitle value is invalid.')),
        extension: joi.string().regex(validationUtils.allFormatsReg).required().error(new Error('The extension value is invalid.')),
        dataformat: joi.string().trim().error(new Error('The dataformat value is invalid.')), //is not required here
        previewUrl: joi.string().trim(),
        fields: joi.array().min(1).required().error(new Error('The fields value is invalid.')),
        sortkey: joi.string().trim().min(3).error(new Error('The sortkey value is invalid.')),
      })
    ).error;

    if(validationError) return validationError.message;

    if(validationUtils.contentFormatReg.test(collection.extension)){
      //content files, data format is required
      validationError = joi.validate(collection.dataformat,
        joi.string().regex(validationUtils.dataFormatReg).required().error(new Error('The dataformat value is invalid.'))
      ).error;

      if(validationError) return validationError.message;
    }
    else{
      //data files, dataformat must be empty or match extension
      if(collection.dataformat && collection.dataformat != collection.extension){
        return 'The dataformat value does not match the extension value.';
      }
    }

    this.checkFieldsKeys(collection.fields, `Collection[key=${collection.key}]`);

    return null;
  }

  validateSingle(single){

    let validationError = null;

    validationError = joi.validate(single, joi.object().required().error(new Error('The single configuration is required.'))).error;
    if(validationError) return validationError.message;

    //validate all fields common to content or data files
    validationError = joi.validate(single,
      joi.object().keys({
        key: joi.string().trim().regex(/^[A-Za-z0-9\-_]+$/i).min(3).max(90).required().error(new Error('The single key "'+single.key+'" is invalid.')),
        title: joi.string().trim().min(3).max(90).required().error(new Error('The singles.title value is invalid.'+JSON.stringify(single))),
        file: joi.string().trim().regex(/^.+$/).regex(/^(?!.*[.][.]).*$/).required().error(new Error('The singles.file value is invalid.'+JSON.stringify(single))),
        dataformat: joi.string().trim().error(new Error('The singles.dataformat value is invalid.')),
        previewUrl: joi.string().trim(),
        fields: joi.array().min(1).required().error(new Error('The singles.fields value is invalid.')),
        _mergePartial: joi.any().forbidden().error(new Error('The singles.mergePartial value could not be parsed. Check file paths'))
      })
    ).error;

    if(validationError) return validationError.message;

    let extension = path.extname(single.file).replace('.','');
    if(single.file.startsWith('content')){
      //content file, dataformat must be provided
      validationError = joi.validate(single.dataformat,
        joi.string().trim().regex(validationUtils.dataFormatReg).required().error(new Error('The dataformat value is invalid.'))
      ).error;

      if(validationError) return validationError.message;
    }
    else{
      //data file, dataformat must be empty or match extension
      if(single.dataformat && single.dataformat!==extension)
        return 'The dataformat value does not match the file value.' + single.dataformat;

    }

    this.checkFieldsKeys(single.fields, `Single[key=${single.key}]`);

    return null;
  }
}

module.exports = WorkspaceConfigValidator;
