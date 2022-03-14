{}:

let
  config = rec {
    permittedInsecurePackages = [ "electron-5.0.13" ];
  };
  pkgs = import <nixpkgs> { inherit config; };
  nixos05 = import <nixos05> {
    config = {
      allowUnfree = true;
      permittedInsecurePackages = [ "electron-5.0.13" ];
    };
  };

  /*
  nixpkgs.config.packageOverrides = pkgs: {

    #unstable = import <nixos-unstable> { config = { allowUnfree = true; }; };
    nixos05 = import <nixos05> {
      config = {
        permittedInsecurePackages = [ "electron-5.0.13" ];
      };
    };
    };
    */

  inherit (pkgs) lib;

  myPackages = lib.fix' (self: with self;
  {
    embgit = pkgs.buildGoModule rec {
      name = "embgit";
      version = "0.3.4";

      src = pkgs.fetchgit {
        url = "https://github.com/quiqr/embgit.git";
        rev = "${version}";
        sha256 = "sha256:04i1ijch1crmgx49nnl1rbly15gwwwm3hic22v1hgsf0d3zhm0sn";
      };

      vendorSha256 = "sha256:1298s8hyrw7v09hyc4ddkwxdwf0k294n95kv65467y0niw98j6sg";

      meta = with lib; {
        description = ''
          Embedded Git for electron apps
        '';
        homepage = "https://github.com/quiqr/embgit";
        license = licenses.mit;
      };
    };
  });
in
  pkgs.mkShell {
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      nixos05.stdenv.cc.cc
      nixos05.zlib
    ];

    nativeBuildInputs = [
      nixos05.nodejs
      nixos05.hugo
      nixos05.electron_5
      myPackages.embgit
      nixos05.xdg-utils
    ];
    ELECTRON_OVERRIDE_DIST_PATH = "${nixos05.electron_5}/bin/";
    NIX_LD = builtins.readFile "${pkgs.stdenv.cc}/nix-support/dynamic-linker";
    EMBGIT_PATH="${myPackages.embgit}/bin/embgit";
    HUGO_PATH="${pkgs.hugo}/bin/hugo";
  }
