{
  description = "Quiqr Desktop DevShell";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-22.11";
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs, nixpkgs-unstable, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
       let
         pkgs = import nixpkgs {
           system = system;
           config.allowUnfree = true;
           config.permittedInsecurePackages = [ "electron-9.4.4"];
         };

         pkgs-unstable = import nixpkgs-unstable {
           system = system;
         };

         lib = pkgs.lib;

       in
       {
         devShells.default = import ./shell.nix {
           inherit pkgs;
           inherit pkgs-unstable;
           inherit lib;
         };
       }
    );
}

