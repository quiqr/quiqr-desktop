const https = require('https');
const { exec } = require("child_process");
const fs = require('fs')
const REPO = "quiqr/embgit"

const gitFileWriter = fs.createWriteStream('resources/all/build-git-id.txt', {})
const dateFileWriter = fs.createWriteStream('resources/all/build-date.txt', {})

const buildDate = new Date().toString();
dateFileWriter.write(buildDate+"\n");

const getContent = function(host, path) {
  return new Promise((resolve, reject) => {
    const request = https.get({
      headers: {
        "User-Agent": "Node"
      },
      host,
      path
    }, (response) => {
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err) => reject(err))
  });
};

exec("git rev-parse --short HEAD", async (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }
  gitFileWriter.write(stdout); // append string to your file

  const res = await getContent("api.github.com", `/repos/${REPO}/releases`);
  const json = JSON.parse(res);
  const newest = json[0];
  const newestVersion = newest.tag_name;
  const embgitTxt = `\nembgit v${newestVersion}\nCopyright Quiqr. 2022`
  gitFileWriter.write(embgitTxt); // append string to your file
});
