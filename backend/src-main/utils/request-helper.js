const fs                        = require('fs-extra');
const request                   = require('request');

class RequestHelper{

  dumpJSONBodyFromGetRequestToFileAndReturn(url, filePath){
    return new Promise((resolve, reject)=>{
      try {
        const req = request({
          method: 'GET',
          url: url
        });
        req.on('response', (response) => {
          if(response.statusCode === 200){
            response.on('data',async (chunk) => {
              const content = chunk.toString();
              await fs.writeFileSync( filePath, content, 'utf-8');
              resolve(content);
            });
          }
          else{
            resolve(response.statusCode);
          }
        });
        req.on('error', (e) => {
          reject(e);
        });
        req.end();
      }
      catch(e){
        reject(e);
      }
    });
  }
}

module.exports = new RequestHelper();
