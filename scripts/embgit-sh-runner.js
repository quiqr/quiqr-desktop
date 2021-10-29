const { exec } = require("child_process");
const prefixlog = "embgit.sh -> ";
let command;

if(process.platform === "win32"){
  command = "c:\\Program Files\\Git\\bin\\bash.exe", ".\\scripts\\embgit.sh -d -p"
}
else{
  command = "./scripts/embgit.sh -d -p"
}

exec(command, async (error, stdout, stderr) => {
  if (error) {
    console.log(`${prefixlog}error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`${prefixlog}stderr: ${stderr}`);
    return;
  }
  console.log(`${prefixlog}stdout: ${stdout}`);
});
