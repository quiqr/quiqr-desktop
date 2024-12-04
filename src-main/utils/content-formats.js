const SUPPORTED_CONTENT_EXTENSIONS = ['md','markdown','html', 'qmd'];

module.exports.SUPPORTED_CONTENT_EXTENSIONS = SUPPORTED_CONTENT_EXTENSIONS;

module.exports.allValidContentFilesExt = function(filePath ){
  return filePath && (filePath.endsWith('.md') || filePath.endsWith('.markdown') || filePath.endsWith('.markdown'));
}

module.exports.isContentFile = function(filePath ){
  if(filePath===undefined) return false;
  let parts = filePath.split('.');
  return SUPPORTED_CONTENT_EXTENSIONS.indexOf(parts[parts.length-1])>=0;
}
