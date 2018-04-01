#!/bin/sh
set -e
VERSIONS="5.0 5.1 5"
PACKAGES="common compiler core forms platform-browser platform-browser-dynamic"

for version in $VERSIONS
do
  echo Building with Angular $version...
  OLD=""
  NEW=""
  for package in $PACKAGES
  do
    OLD="$OLD @angular/$package"
    NEW="$NEW @angular/$package@$version"
  done

  npm uninstall --no-save $OLD
  npm install --no-save $NEW
  npm run build:all
done
echo Testing complete
npm install
