# Development Documentation

Here are some instructions to assist with local development and publishing.

## Local development

```sh
docker run -d -p 3000:3000 -v "$(pwd)"/grafana-plugins:/var/lib/grafana/plugins --name=grafana grafana/grafana
```

## Publish

1. Test plugin with <https://github.com/grafana/plugin-validator>
1. Change version in package.json
1. Commit changes
1. Create new tag for plugin
   - `git tag -a vx.x.x -m "Release vx.x.x"`
   - `git push --tags`
1. Add token to `keys.env` and sign the plugin `npx @grafana/toolkit plugin:sign`
1. Run `package.sh` to bundle and zip plugin and make md5
1. Attach zip and md5 files to new release on Github
1. Publish to Grafana plugins
   - Clone grafana-plugin-repository or update a fork of grafana-plugin-repository (Used <https://stefanbauer.me/articles/how-to-keep-your-git-fork-up-to-date>)
     - First time only, create the upstream branch
       `git remote add upstream https://github.com/grafana/grafana-plugin-repository.git`
     - `git fetch upstream`
     - `git merge upstream/master master`
   - Update the `repo.json` file
   - Create a PR
