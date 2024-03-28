#!/bin/bash
# This file is used to package the dist folder for Grafana Cloud
set -e
if [ -z "$1" ]; then
	# Local
	tag=$(git describe --abbrev=0)
	export $(xargs <keys.env)
else
	# When Actions pass in tag
	tag="$1"
fi
echo "Packaging $tag"

rm -f nline-plotlyjs-panel-"${tag}".*
rm -rf dist
yarn install && yarn build && npx @grafana/sign-plugin@latest

cp -r dist nline-plotlyjs-panel
zip -r nline-plotlyjs-panel.zip nline-plotlyjs-panel
mv nline-plotlyjs-panel.zip nline-plotlyjs-panel-"${tag}".zip
md5sum nline-plotlyjs-panel-"${tag}".zip >nline-plotlyjs-panel-"${tag}".zip.md5
rm -rf nline-plotlyjs-panel
