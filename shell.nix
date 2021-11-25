{}:

let
  config = rec {
    permittedInsecurePackages = [ "electron-5.0.13" ];
  };
  pkgs = import <nixpkgs> { inherit config; };

  inherit (pkgs) lib;

  myPackages = lib.fix' (self: with self;
  {
    embgit = pkgs.buildGoModule rec {
      name = "embgit";
      version = "0.3.2";

      src = pkgs.fetchgit {
        url = "https://github.com/poppygo/embgit.git";
        rev = "${version}";
        sha256 = "sha256:04i1ijch1crmgx49nnl1rbly15gwwwm3hic22v1hgsf0d3zhm0sn";
      };

      vendorSha256 = "sha256:1298s8hyrw7v09hyc4ddkwxdwf0k294n95kv65467y0niw98j6sg";

      meta = with lib; {
        description = ''
          Embedded Git for electron apps
        '';
        homepage = "https://github.com/poppygo/embgit";
        license = licenses.mit;
      };
    };
  });
in
  pkgs.mkShell {
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      pkgs.stdenv.cc.cc
    #  pkgs.libGL
      pkgs.zlib
    #  pkgs.glib
    ];

    nativeBuildInputs = [
      pkgs.nodejs
      pkgs.hugo
      pkgs.electron_5
      myPackages.embgit
    ];
    ELECTRON_OVERRIDE_DIST_PATH = "${pkgs.electron_5}/bin/";
    NIX_LD = builtins.readFile "${pkgs.stdenv.cc}/nix-support/dynamic-linker";
    EMBGIT_PATH="${myPackages.embgit}/bin/embgit";
    HUGO_PATH="${pkgs.hugo}/bin/hugo";
  }
