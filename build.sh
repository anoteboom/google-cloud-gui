#!/bin/bash

CURRENT_DIR=$(dirname "$0")

echo "${CURRENT_DIR}"

cd "${CURRENT_DIR}"
rm -fr build
mkdir -p build

cp README.md build/

cd "${CURRENT_DIR}/server"
yarn
cp -r . ../build/

cd "${CURRENT_DIR}/client"
yarn
yarn build

cp -r build ../build/src/public
