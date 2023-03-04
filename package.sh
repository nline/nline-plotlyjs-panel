#!/bin/bash
# This file is used to package the dist folder for Grafana Cloud
set -e
tag=$(git describe --abbrev=0)
echo "Packaging $tag"

export $(xargs <keys.env) 

rm -rf dist
yarn build && npx @grafana/sign-plugin@latest

cp -r dist nline-plotlyjs-panel
zip -r nline-plotlyjs-panel.zip nline-plotlyjs-panel
mv nline-plotlyjs-panel.zip nline-plotlyjs-panel-${tag}.zip
md5 nline-plotlyjs-panel-${tag}.zip > nline-plotlyjs-panel-${tag}.zip.md5

rm -rf nline-plotlyjs-panel
