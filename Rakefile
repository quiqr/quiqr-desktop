require "json"

BIN_PATH = "/Users/pim/cPoppyGo/poppygo.app-site/public"

desc "create_release"
task :create_release do

  file = File.open "package.json"
  data = JSON.load file
  git tag -a v0.5.1
   git commit -m 'release 0.5.1' -a
  sh "git push --follow-tags"
  sh "npm run dist-mac && npm run dist-mac-notarize"
  sh "cp dist/poppygo_mac.dmg #{BIN_PATH}/poppygo_mac-#{data['version']}.dmg"
  sh "cd #{BIN_PATH} && git add ./*"
  sh "cd #{BIN_PATH} && git commit -m 'release #{ data['version']}'"
  sh "cd #{BIN_PATH} && git push"
end
