const fs = require('fs-extra');
const { Jimp } = require('jimp');
const path = require('path');

const action = async ({src , dest}) => {
  if (!fs.existsSync(src)) {
    throw new Error('image file does not exist');
  }

  await fs.ensureDir(path.dirname(dest));

  const ext = path.extname(src).toLowerCase();

  if(ext === ".gif" || ext === ".svg" || ext === ".ico" ) {
    await fs.copy(src, dest);

    return 'image copied';
  }

  try {
    const image = await Jimp.read(src);
    await image.scaleToFit({h: 400, w: 400}).write(dest);
  } catch (e) {
    throw new Error(e)
  }
  
  // Use fs.existsSync instead of deprecated fs.exists
  let thumbExists = fs.existsSync(dest);
  if(!thumbExists){
    throw new Error('Thumbnail creation failed - file does not exist after processing');
  }

  
}

module.exports = action;
