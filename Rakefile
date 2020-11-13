require "json"
require "date"

BIN_PATH = "../poppygo.app-site/public"
BIN_PATHWIN = "..\\poppygo.app-site\\public"

def getmeta
  file = File.open "package.json"
  JSON.load file
end

def set_build_info
  sh "git rev-parse --short HEAD > resources/all/build-git-id.txt"

  d=DateTime.now()
  sh "echo \""+d.strftime("%m-%d-%Y at %I:%M%p in Amsterdam") + "\" > resources/all/build-date.txt"
end

task :default => [:help]

desc "show options and tasts"
task :help do
  print "\n"
  system "rake --tasks"
  print "\n"
end

desc "tag_release (1)"
task :tag_release do
  data = getmeta
  sh "git tag -a v#{data['version']}"
  sh "git push --follow-tags"
end

desc "buildmac (2)"
task :buildmac do
  set_build_info
  sh "npm run dist-mac && npm run dist-mac-notarize"
end

desc "release_mac (3)"
task :release_mac do
  data = getmeta
  sh "cp dist/poppygo_mac.dmg #{BIN_PATH}/poppygo_mac-#{data['version']}.dmg"
  sh "cd #{BIN_PATH} && git pull"
  sh "cd #{BIN_PATH} && git add ./poppygo_mac-#{data['version']}.dmg"
  sh "cd #{BIN_PATH} && git commit -m 'mac release #{ data['version']}'"
  sh "cd #{BIN_PATH} && git push"
end

desc "buildwin"
task :buildwin do
  set_build_info
  sh "npm run dist-win"
end

desc "buildlinux"
task :buildlinux do
  set_build_info
  sh "npm run dist-linux"
end

desc "release_win"
task :release_win do
  data = getmeta
  sh "copy dist\\poppygo_win.exe #{BIN_PATHWIN}\\poppygo_win-#{data['version']}.exe"
  sh "cd #{BIN_PATHWIN} && git add poppygo_win-#{data['version']}.exe"
  sh "cd #{BIN_PATHWIN} && git commit -m \"win release #{ data['version']}\""
  sh "cd #{BIN_PATHWIN} && git push"
end
