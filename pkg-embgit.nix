{ pkgs, lib, ...}:

pkgs.buildGo118Module rec {
  name = "embgit";
  version = "0.6.4";

  src = pkgs.fetchgit {
    url = "https://github.com/quiqr/embgit.git";
    rev = "${version}";
    sha256 = "sha256-0eEBKhJIcKGoW8Nd1/L4849Ew99GAKoRh3otuVw4P3o=";
    #sha256 = lib.fakeSha256;
  };

  vendorSha256 = "sha256-e0CXBakEXyWOPOmw1ORHUmWfHCcWkNGR0dwtdNXG9Xo=";
  #vendorSha256 = lib.fakeSha256;

  postInstall = ''
    cp "$out/bin/src" "$out/bin/embgit"
    '';

  meta = with lib; {
    description = "Embedded Git for electron apps";
    homepage = "https://github.com/quiqr/embgit";
    license = licenses.mit;
  };
}
