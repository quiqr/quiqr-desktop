const fs = require('fs');
const fetch = require('node-fetch');

async function getRemoteReleases(username, repository, page) {
  if(!username) throw new TypeError("Username was not provided (first parameter), received " + username);
  if(!repository) throw new TypeError("Repository was not provided (second parameter), received " + repository);
  let json = await fetch(`https://api.github.com/repos/${username}/${repository}/releases?per_page=100&page=${page}`).then(res => res.json());
  if(json.message) throw new TypeError("User or repository was not found");

  console.log(json.assets)
  json = json.map(obj => obj.name);
  return json;
}

async function run(useLocalJson){

  let allVersions = [];
  let featureVersions = {};
  let filteredVersions = [];

  if(useLocalJson){
    let data = await fs.readFileSync('resources/all/allVersions.json', 'utf-8');
    allVersions = JSON.parse(data.toString());
  }
  else{
    let versions = [];
    let i=1;
    while(true){
      versions = await getRemoteReleases("gohugoio", "hugo", i);
      i++;
      if(versions.length === 0) break;
      allVersions = allVersions.concat(versions);
    }

    try {
      fs.writeFileSync('resources/all/allVersions.json', JSON.stringify(allVersions));
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
    fs.writeFileSync('resources/all/filteredHugoVersions.json', JSON.stringify(filteredVersions));
    console.log("JSON data is saved.");
  } catch (error) {
    console.error(err);
  }

}

run(false);
