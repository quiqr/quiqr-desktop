{ pkgs, pkgs-unstable, lib, ... }:

let
  myPackages = lib.fix' (self: with self;
  {
    embgit = import ./pkg-embgit.nix { inherit pkgs; inherit lib; };
  });
in
  pkgs.mkShell {
    nativeBuildInputs = [
      #pkgs.nodejs-16_x
      pkgs.nodejs-18_x
      pkgs.p7zip
      pkgs.electron_9
      pkgs.xdg-utils

      pkgs-unstable.hugo
      myPackages.embgit
    ];
    ELECTRON_OVERRIDE_DIST_PATH = "${pkgs.electron_9}/bin/";
    EMBGIT_PATH="${myPackages.embgit}/bin/embgit";
    HUGO_PATH="${pkgs-unstable.hugo}/bin/hugo";
    P7ZIP_PATH="${pkgs.p7zip}/bin/7za";
  }
