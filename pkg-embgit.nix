{ pkgs, lib, ...}:

pkgs.buildGo118Module rec {
  name = "embgit";
  version = "0.6.3";

  src = pkgs.fetchgit {
    url = "https://github.com/quiqr/embgit.git";
    rev = "${version}";
    sha256 = "sha256-buiLjqXFLdKy4TdQmpAxELM0bjTZpm8xrTXTinpl/Jk=";
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
