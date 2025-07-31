{
  description = "A Nix-flake-based JavaScript development environment";
  inputs = { nixpkgs.url = "github:NixOS/nixpkgs?ref=nixos-unstable"; };
  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
    in {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          nodejs
          yarn
          pnpm
          # nodePackages.typescript
          # nodePackages.eslint
          nodePackages.prettier
          nodePackages.typescript-language-server
        ];
      };
    };
}
