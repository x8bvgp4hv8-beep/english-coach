#!/bin/zsh
set -euo pipefail

repo_root="${0:A:h:h}"
cd "$repo_root/native"
swift build -c release

app="$repo_root/dist/English Coach.app"
rm -rf "$app"
mkdir -p "$app/Contents/MacOS" "$app/Contents/Resources"
cp .build/release/EnglishCoach "$app/Contents/MacOS/EnglishCoach"
cp "$repo_root/native/Resources/Info.plist" "$app/Contents/Info.plist"
cp "$repo_root/native/Resources/AppIcon.icns" "$app/Contents/Resources/AppIcon.icns"

core_bundle="$(find .build -path '*release/EnglishCoach_EnglishCoachCore.bundle' -type d -print -quit)"
if [[ -z "$core_bundle" ]]; then
  echo "Course resource bundle was not produced" >&2
  exit 1
fi
cp -R "$core_bundle" "$app/Contents/Resources/EnglishCoach_EnglishCoachCore.bundle"

codesign --force --deep --sign - "$app"
echo "$app"
