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
      name = "embgit";
      version = "0.6.2";

      src = pkgs.fetchgit {
        url = "https://github.com/quiqr/embgit.git";
        rev = "${version}";
        sha256 = "sha256-3SwuPFpkFwwBTLpNzxPjHtVjWiSdZAYUt4neUQ1mIEA=";
        #sha256 = lib.fakeSha256;
      };

      vendorSha256 = "sha256-bHjHnaq82lbQBhIsqHMddA/AAgxFcoofVJV1RaD5U8Q=";
      #vendorSha256 = lib.fakeSha256;

      postInstall = ''
         cp "$out/bin/src" "$out/bin/embgit"
      '';

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
    nativeBuildInputs = [
      pkgs.nodejs-16_x
      pkgs.hugo
      pkgs.p7zip
      pkgs.electron_9
      myPackages.embgit
      pkgs.xdg-utils
    ];
    ELECTRON_OVERRIDE_DIST_PATH = "${pkgs.electron_9}/bin/";
    EMBGIT_PATH="${myPackages.embgit}/bin/embgit";
    HUGO_PATH="${pkgs.hugo}/bin/hugo";
    P7ZIP_PATH="${pkgs.p7zip}/bin/7za";
  }
