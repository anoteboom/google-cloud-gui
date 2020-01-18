#!/bin/bash

CURRENT_DIR=$(
  cd "$(dirname "$0")" || exit
  pwd
)

echo "${CURRENT_DIR}"

echo "##"
echo "## Re Make build directly"
echo "##"

cd "${CURRENT_DIR}" || exit
rm -fr build
mkdir -p build

echo "##"
echo "## Copy README.md"
echo "##"
cp README.md build/

echo "##"
echo "## Build server side"
echo "##"
cd "${CURRENT_DIR}/server" || exit
yarn
cp -r . ../build/

echo "##"
echo "## Build client side"
echo "##"
cd "${CURRENT_DIR}/client" || exit
yarn
yarn build

cp -r build/* ../build/src/public
