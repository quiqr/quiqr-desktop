{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { systems, nixpkgs, ... }@inputs:
    let
      eachSystem = f: nixpkgs.lib.genAttrs (import systems) (system: f nixpkgs.legacyPackages.${system});
    in
      {
      devShells = eachSystem (pkgs:
        {
          default =
            let
              myPackages = pkgs.lib.fix' (self: with self;
                {
                  embgit = import ./pkg-embgit.nix { inherit pkgs; lib=pkgs.lib; };
                });
            in
            pkgs.mkShell
            {
              ELECTRON_OVERRIDE_DIST_PATH = "${pkgs.electron}/bin/";
              EMBGIT_PATH="${myPackages.embgit}/bin/embgit";
              HUGO_PATH="${pkgs.hugo}/bin/hugo";
              buildInputs = [
                pkgs.nodejs
                pkgs.electron
                pkgs.pnpm
                pkgs.nodePackages.typescript
                pkgs.nodePackages.typescript-language-server
              ];
            };
        });
    };
}
