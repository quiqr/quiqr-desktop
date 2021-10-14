{}:

let
  config = rec {
    allowUnfree = true;
    allowBroken = true;
    permittedInsecurePackages = [ "electron-5.0.13" ];
  };
  pkgs = import <nixpkgs> { inherit config; };
in
  pkgs.mkShell {

    permittedInsecurePackages = [ "electron-5.0.13" ];

    nativeBuildInputs = [
      pkgs.nodejs
      pkgs.electron_5
    ];
    ELECTRON_OVERRIDE_DIST_PATH = "${pkgs.electron_5}/bin/";
  }
