# Plotly Panel

[![Marketplace](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=marketplace&prefix=v&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22grafana-plotly-panel%22%29%5D.version&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/grafana-plotly-panel)
[![Downloads](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=downloads&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22grafana-plotly-panel%22%29%5D.downloads&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/grafana-plotly-panel)

[https://github.com/nline/grafana-plotly-panel](https://github.com/nline/grafana-plotly-panel)

Render any kind of charts from any datasource with [Plotly](https://plotly.com/javascript/) (An open source javascript graphing library)

Unlike the [natel-plotly-panel](https://github.com/NatelEnergy/grafana-plotly-panel), this plugin is not limited to specific types of charts. But, on the other hand, the user interface is really rough in order to let users to set all options available in Plotly.

The _Data_, _Layout_ and _Config_ fields match the common parameters described in [Plotly's documentation](https://plotly.com/javascript/plotlyjs-function-reference/). They must be in JSON format.

Data provided by the datasource can be transformed via a user-defined script before to be injected in the Plotly chart. The script includes 2 arguments :

- `data` : Data returns by the datasource
- `variables` : Object that contains [Grafana's variables](https://grafana.com/docs/grafana/latest/variables/) available in the current dashboard (user variables and few global variables: `__from`, `__to`, `__interval` and `__interval_ms`).

The script must return an object with one or more of the following properties: `data`, `layout`, `config` and `frames`.

example :

```javascript
let x = data.series[0].fields[0].values.buffer;
let y = data.series[0].fields[1].values.buffer;

let serie = {
  x: x,
  y: y,
  name: variables.project, //where project is the name of a Grafana's variable
};

return {
  data: [serie],
  config: {
    displayModeBar: false,
  },
};
```

Object returned by the script and JSON provided in the _Data_, _Layout_ and _Config_ fields will be merged (deep merge).

If no script is provided, the panel will use only _Data_, _Layout_ and _Config_ fields.

Plotly panel editor :

![Editor](https://raw.githubusercontent.com//nline/grafana-plotly-panel/master/src/img/editor.png)

Example of charts :

![Panel](https://raw.githubusercontent.com//nline/grafana-plotly-panel/master/src/img/panel.png)
