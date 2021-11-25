require "json"
require "date"

BIN_PATH = "../poppygo.app-site/public"
BIN_PATHWIN = "..\\poppygo.app-site\\public"

def getmeta
  file = File.open "package.json"
  JSON.load file
end

def windows?
  (/cygwin|mswin|mingw|bccwin|wince|emx/ =~ RUBY_PLATFORM) != nil
end

def set_build_info
  sh "git rev-parse --short HEAD > resources/all/build-git-id.txt"
  if windows?
    sh ".\\dist\\embgit.exe version >> resources\\all\\build-git-id.txt"
  else
    sh "echo "" >> resources/all/build-git-id.txt"
    sh "./dist/embgit version >> resources/all/build-git-id.txt"
  end
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
  sh "./scripts/embgit.sh -d -b ./dist"
  sh "cp ./dist/embgit ./resources/mac"
  set_build_info
  sh "npm install"
  sh "npm run dist && npm run _mac-notarize"
end

desc "buildmacunsigned"
task :buildmacunsigned do
  sh "./scripts/embgit.sh -d -b ./dist"
  sh "cp ./dist/embgit ./resources/mac"
  set_build_info
  sh "npm install"
  sh "CSC_IDENTITY_AUTO_DISCOVERY=false npm run dist"
end

desc "macoscodesigninfo"
task :macoscodesigninfo do
  sh "security find-identity -v -p codesigning"
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

desc "thirdpartynotice"
task "thirdpartynotice" do

 fileout = <<HDOC
POPPYGO

THIRD-PARTY SOFTWARE NOTICES AND INFORMATION
Do Not Translate or Localize

This project incorporates components from the projects listed below. The
original copyright notices and the licenses under which PoppyGo received such
components are set forth below. PoppyGo reserves all rights not expressly
granted herein, whether by implication, estoppel or otherwise.

HDOC
 jsontree = `license-checker --production --json`
 licenceobj = JSON.parse(jsontree)
 counter = 0
 licenceobj.each do | lib, info |
   counter+=1
   lib = lib[1..-1] if lib[0,1] == '@'
   libname, version = lib.split('@')

   fileout += "#{counter.to_s.rjust(4)} #{libname} version #{version}, Licence: #{info['licenses']}, Repository: #{info['repository']}\n"
 end

 File.open('./ThirdPartyNotices.txt', 'w') { |file| file.write(fileout) }
end
