# Publish

1. Change version in package.json
1. Build the plugin `npm run build`
1. Add token to env `set GRAFANA_API_KEY=<my_api_key>` and sign the plugin `npx @grafana/toolkit plugin:sign`
1. Commit changes
1. Create new tag for plugin
    - `git tag -a vx.x.x -m "release vx.x.x"`
    - `git push origin master --follow-tags`
1. Create new release on Github
1. Rename `dist` folder to `grafana-plotly-panel-x.x.x` and zip it (Due to current trouble with signature process, move all image to root of `dist` folder and update `plugin.json` accordingly).
1. Generate md5 with command `md5 grafana-plotly-panel-x.x.x.zip > grafana-plotly-panel-x.x.x.zip.md5`
1. Attach zip and md5 files to release on Github.
1. Test plugin with https://github.com/grafana/plugin-validator
1. Publish to Grafana plugins
    - Clone grafana-plugin-repository or update my fork of grafana-plugin-repository (Used https://stefanbauer.me/articles/how-to-keep-your-git-fork-up-to-date)
        - First time only, created the upstream branch 
        `git remote add upstream https://github.com/grafana/grafana-plugin-repository.git`
        - `git fetch upstream`
        - `git merge upstream/master master`
    - Update the `repo.json` file
    - Create a PR
