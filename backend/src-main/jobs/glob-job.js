const glob = require('glob');

const action = async ({expression, options}) => {
    return new Promise((resolve,reject)=>{
        glob(expression, options, (err, matches)=>{
            if(err){
                reject(err);
                return;
            }
            resolve(matches);
        })
    })
}

module.exports = action;
