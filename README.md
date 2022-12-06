# Plotly Panel

Render charts with [Plotly.js](https://plotly.com/javascript/).

A maintained fork of [ae3e-plotly-panel](https://github.com/ae3e/ae3e-plotly-panel) with:

- Updated Plotly.js package
- Ability to export plot as image (fixed)
- Expandable code editors
- YAML support
- Updated dependencies
- Depreciated packages/code removed
- Linting, style standardization, code correction
- Better documentation

Unlike the [natel-plotly-panel](https://github.com/NatelEnergy/grafana-plotly-panel), this plugin is not limited to specific types of charts. This plugin allows fine grained control over the `data`, `layout`, and`config` parameters used to build a Plotly plot.

[![Marketplace](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=marketplace&prefix=v&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22nline-plotlyjs-panel%22%29%5D.version&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/nline-plotlyjs-panel)
[![Downloads](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=downloads&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22nline-plotlyjs-panel%22%29%5D.downloads&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/nline-plotlyjs-panel)

---

## Getting started

The _Data_, _Layout_ and _Config_ fields match the common parameters described in [Plotly's documentation](https://plotly.com/javascript/plotlyjs-function-reference/). They must be in JSON format as described [by this schema](https://raw.githubusercontent.com/plotly/plotly.js/master/dist/plot-schema.json), however they are parsed and interpreted as YAML for ease of use in development. These fields are consumed by Plotly `{  data: [traces], layout: layout, config: config }` and produce a Plotly graph within the panel. They can be collapsed, expanded (by dragging) and used to format the contents (like VSCode).

Data provided by the data source can be transformed via a user-defined script before being delivered to the Plotly chart. This `script` section includes 2 implicit variables that can be used:

- `data`: Data returned by the datasource query. See the example below for the object's schema.
- `variables`: Object that contains [Grafana's dashboard variables](https://grafana.com/docs/grafana/latest/variables/) available in the current dashboard (user variables as well as a few global variables: `__from`, `__to`, `__interval` and `__interval_ms`).

The script must return an object with one or more of the following properties:

- `data`
- `layout`
- `config`
- `frames`

**Note:** The `data` and `frames` properties are arrays of dictionaries/JSON and must begin with a dash (as per YAML specs) or added as an array in the return of the function.

For example:

```javascript
let x = data.series[0].fields[0].values.buffer;
let y = data.series[0].fields[1].values.buffer;

let series = {
  x: x,
  y: y,
  name: variables.dash_var, // where 'dash_var' is the name of a Grafana dashboard variable
};

return {
  data: [series],
  config: {
    displayModeBar: false,
  },
};
```

## Images

<div float="left" align="center">
  <img src="src/img/panel.png" width="45%"/>
  <img src="src/img/editor.png" width="45%"/>
</div>
