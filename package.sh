#!/bin/bash
# This file is used to package the dist folder for Grafana Cloud
set -e

npm run dev && npx @grafana/toolkit plugin:sign --rootUrls http://localhost:3000 && npm run build 
tag=$(git describe --abbrev=0)
cp -r dist jacksongoode-plotly-plugin
zip -r jacksongoode-plotly-plugin.zip jacksongoode-plotly-plugin
mv jacksongoode-plotly-plugin.zip jacksongoode-plotly-plugin-${tag}.zip
md5 jacksongoode-plotly-plugin-${tag}.zip > jacksongoode-plotly-plugin-${tag}.zip.md5
rm -rf jacksongoode-plotly-plugin