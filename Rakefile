require "json"

BIN_PATH = "../poppygo.app-site/public"

desc "tag_release"
task :tag_release do
  file = File.open "package.json"
  data = JSON.load file
  sh "git tag -a v#{data['version']}"
  sh "git push --follow-tags"
end

desc "create_mac_bin"
task :create_mac_bin do
  sh "npm run dist-mac && npm run dist-mac-notarize"
  sh "cp dist/poppygo_mac.dmg #{BIN_PATH}/poppygo_mac-#{data['version']}.dmg"
  sh "cd #{BIN_PATH} && git add ./poppygo_mac-#{data['version']}.dmg"
  sh "cd #{BIN_PATH} && git commit -m 'mac release #{ data['version']}'"
  sh "cd #{BIN_PATH} && git push"
end

desc "create_release_win"
task :create_release_win do
  sh "npm run dist-win"
  sh "cp dist/poppygo_win.exe #{BIN_PATH}/poppygo_win-#{data['version']}.exe"
  sh "cd #{BIN_PATH} && git add ./poppygo_win-#{data['version']}.exe"
  sh "cd #{BIN_PATH} && git commit -m 'win release #{ data['version']}'"
  sh "cd #{BIN_PATH} && git push"
end
