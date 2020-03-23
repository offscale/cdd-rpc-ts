{ pkgs ? import <nixpkgs> { } }:
pkgs.mkShell {
  name = "rust-env";

  buildInputs = with pkgs; [
    nodejs
    nodePackages.typescript
  ];

  shellHook = "";
}