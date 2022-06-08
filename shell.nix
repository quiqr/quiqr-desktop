{}:

let
  config = rec {
    permittedInsecurePackages = [ "electron-5.0.13" "electron-9.4.4"];
  };
  pkgs = import <nixpkgs> { inherit config; };
  nixos05 = import <nixos05> {
    config = {
      allowUnfree = true;
      permittedInsecurePackages = [ "electron-5.0.13" "electron-9.4.4"];
    };
  };

  inherit (pkgs) lib;

  myPackages = lib.fix' (self: with self;
  {
    embgit = pkgs.buildGo118Module rec {
    #embgit = pkgs.buildGoModule rec {
      name = "embgit";
      version = "0.4.2";

      src = pkgs.fetchgit {
        url = "https://github.com/quiqr/embgit.git";
        rev = "${version}";
        sha256 = "sha256:1hzk5w08gbqac6paax5k8b57p6zfw2fg5jgcgw4g3c2139ns36i3";
        #sha256 = lib.fakeSha256;
      };

      vendorSha256 = "sha256:0l5fcx74fqp622q7lm4qanmg9ax03s14vcf4hx4r4qnmvs2r2pw8";
      #vendorSha256 = lib.fakeSha256;

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
#    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
#      nixos05.stdenv.cc.cc
#      nixos05.zlib
#    ];

    nativeBuildInputs = [
      pkgs.nodejs
      pkgs.hugo
      pkgs.electron_9
      myPackages.embgit
      pkgs.xdg-utils
    ];
    ELECTRON_OVERRIDE_DIST_PATH = "${pkgs.electron_9}/bin/";
    #NIX_LD = builtins.readFile "${pkgs.stdenv.cc}/nix-support/dynamic-linker";
    #EMBGIT_PATH="${myPackages.embgit}/bin/embgit";
    EMBGIT_PATH="${myPackages.embgit}/bin/src"; #STUPID HACK
    HUGO_PATH="${pkgs.hugo}/bin/hugo";
  }
