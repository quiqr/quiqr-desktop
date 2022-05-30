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
    embgit = pkgs.buildGoModule rec {
      name = "embgit";
      version = "0.3.6";

      src = pkgs.fetchgit {
        url = "https://github.com/quiqr/embgit.git";
        rev = "${version}";
        sha256 = "sha256:1fr8p7p9czf3bw0k432kc2lcnv3kglkn5wnxw3gir935nn56iyk6";
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
    EMBGIT_PATH="${myPackages.embgit}/bin/embgit";
    HUGO_PATH="${pkgs.hugo}/bin/hugo";
  }
