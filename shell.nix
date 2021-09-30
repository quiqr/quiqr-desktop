with import <nixpkgs> {};



mkShell {

  permittedInsecurePackages = [
    "electron-5.0.13"
  ];


  nativeBuildInputs = [
    nodejs
    electron_5
  ];
   ELECTRON_OVERRIDE_DIST_PATH = "${electron_5}/bin/";
}
