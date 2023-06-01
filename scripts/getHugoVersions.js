const fs = require('fs');
const fetch = require('node-fetch');

async function getRemoteReleases(username, repository, page) {
  if(!username) throw new TypeError("Username was not provided (first parameter), received " + username);
  if(!repository) throw new TypeError("Repository was not provided (second parameter), received " + repository);
  let json = await fetch(`https://api.github.com/repos/${username}/${repository}/releases?per_page=100&page=${page}`).then(res => res.json());
  if(json.message) throw new TypeError("User or repository was not found");

  json = json.map(obj => obj.name);
  return json;
}
async function getRemoteReleasesAndAssets(username, repository, page) {
  if(!username) throw new TypeError("Username was not provided (first parameter), received " + username);
  if(!repository) throw new TypeError("Repository was not provided (second parameter), received " + repository);
  let json = await fetch(`https://api.github.com/repos/${username}/${repository}/releases?per_page=100&page=${page}`).then(res => res.json());
  if(json.message) throw new TypeError("User or repository was not found");

  let dict = {};
  json.forEach((obj)=>{

    let downloads = [];
    obj.assets.forEach((asset)=>{
      downloads.push(asset.browser_download_url);
    });

    dict[obj.name] = downloads;
  })

  return dict;
}
async function run(useLocalJson){

  let allVersions = [];
  let allVersionsDict = {};
  let featureVersions = {};
  let filteredVersions = [];

  if(useLocalJson){
    let data = await fs.readFileSync('resources/all/allVersions.json', 'utf-8');
    allVersions = JSON.parse(data.toString());
  }
  else{
    let versions = [];
    let versionsDict = {};
    let i=1;
    while(true){
      versions = await getRemoteReleases("gohugoio", "hugo", i);
      //versionsDict = await getRemoteReleasesAndAssets("gohugoio", "hugo", i);
      i++;
      if(versions.length === 0) break;
      allVersions = allVersions.concat(versions);
      //allVersionsDict = Object.assign(allVersionsDict, versionsDict);
    }

    try {
      fs.writeFileSync('resources/all/allVersions.json', JSON.stringify(allVersions));
      //fs.writeFileSync('resources/all/allVersionsDict.json', JSON.stringify(allVersionsDict));
    } catch (error) {
      console.error(err);
    }
  }

  allVersions.forEach((version)=>{
    const _t = version.split('.');
    const featurePart = _t[0]+"."+_t[1];

    if(version && !(featurePart in featureVersions) || Number(featureVersions[featurePart]) < Number(_t[2])){
      featureVersions[featurePart] = _t[2];
    }
  });

  for (let featVersion in featureVersions) {
    if(featureVersions[featVersion]){
      filteredVersions.push(featVersion.trim() + "." + featureVersions[featVersion].trim());
    }
    else{
      filteredVersions.push(featVersion.trim());
    }
  }

  try {
    const versionFile = 'resources/all/filteredHugoVersions.json';
    fs.writeFileSync(versionFile, JSON.stringify(filteredVersions));
    console.log("JSON data is saved. in " + versionFile);
  } catch (error) {
    console.error(err);
  }

}

run(false);
