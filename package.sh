#!/bin/bash
# This file is used to package the dist folder for Grafana Cloud
set -e

npm run dev && npx @grafana/toolkit plugin:sign --rootUrls http://localhost:3000 && npm run build 
tag=$(git describe --tags)
cp -r dist nline-plotlyjs-panel
zip -r nline-plotlyjs-panel.zip nline-plotlyjs-panel
mv nline-plotlyjs-panel.zip nline-plotlyjs-panel-${tag}.zip
md5 nline-plotlyjs-panel-${tag}.zip > nline-plotlyjs-panel-${tag}.zip.md5
rm -rf nline-plotlyjs-panel