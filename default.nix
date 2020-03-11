{ pkgs ? import <nixpkgs> { } }:
pkgs.mkShell {
  name = "rust-env";

  buildInputs = with pkgs; [
    nodejs
  ];

  shellHook = "";
}