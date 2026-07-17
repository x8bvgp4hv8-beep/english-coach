#!/bin/zsh
set -euo pipefail

repo_root="${0:A:h:h}"
"$repo_root/scripts/build-macos-app.sh"
mkdir -p "$repo_root/dist"
staging="$(mktemp -d)"
trap 'rm -rf "$staging"' EXIT
cp -R "$repo_root/dist/English Coach.app" "$staging/English Coach.app"
ln -s /Applications "$staging/Applications"
hdiutil create -volname "English Coach" -srcfolder "$staging" -ov -format UDZO "$repo_root/dist/English-Coach.dmg"
echo "$repo_root/dist/English-Coach.dmg"
