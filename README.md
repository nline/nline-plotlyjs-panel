# Plotly Panel

> ⚠️ If you are on Grafana 10, the syntax to access the fields from the `data` variable is different! Use `data.series[0].fields[0].values` without the `buffer` property as it doesn't exist anymore. Before 10, there are stored with the `.buffer` property.

Render charts with [Plotly.js](https://plotly.com/javascript/).

- Export plot as an image (with specified resolution)
- YAML/JSON support
- Automatic/manual timezone adjustment
- Apply `Data` configs across traces
- Expandable code editors
- Grafana variable substitution
- and more!

Unlike the [natel-plotly-panel](https://github.com/NatelEnergy/grafana-plotly-panel), this plugin is not limited to specific types of charts. This plugin allows fine grained control over the `data`, `layout`, and`config` parameters used to build a Plotly plot.

This plugin began as maintained fork of [ae3e-plotly-panel](https://github.com/ae3e/ae3e-plotly-panel) but has been rewritten since.

[![Marketplace](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=marketplace&prefix=v&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22nline-plotlyjs-panel%22%29%5D.version&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/nline-plotlyjs-panel)
[![Downloads](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=downloads&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22nline-plotlyjs-panel%22%29%5D.downloads&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/nline-plotlyjs-panel)

---

## Getting started

The **data**, **layout**, and **config** fields are required objects described in [Plotly's documentation](https://plotly.com/javascript/plotlyjs-function-reference/). They must be in JSON format and structured [by this schema](https://raw.githubusercontent.com/plotly/plotly.js/master/dist/plot-schema.json). However, they can be parsed and interpreted as YAML for ease of use in development (see YAML/JSON toggle). These fields are consumed by Plotly as `{ data: [traces], layout: layout, config: config }` and produce a Plotly graph within the panel.

Data provided by the data source can be transformed via a user-defined script before being delivered to the Plotly chart. This `script` section includes a few implicit variables that can be used:

- `data` - Data returned by the datasource query. See the example below for the object's schema.
- `variables` - Object that contains [Grafana's dashboard variables](https://grafana.com/docs/grafana/latest/variables/) available in the current dashboard (user variables as well as a few global variables: `__from`, `__to`, `__interval` and `__interval_ms`).
- `parameters` - The panel's data, layout, and config objects. This may be helpful in the case of applying static properties from the data panel (as one item rather than an array) across many traces via something like a merge.
- `timeZone` - The dashboard timezone
- `dayjs` - A [tiny timezone library](https://github.com/iamkun/dayjs)
- `matchTimezone` - A convenience function to wrap around timeseries data to convert data to the user's timezone.

The script must return an object with one or more of the following properties:

- `data`
- `layout`
- `config`
- `frames`

**Note:** The `data` and `frames` properties are arrays of dictionaries/JSON and must begin with a dash (as per YAML specs) or added as an array in the return of the function. However, the `data` field can be an object in which case it will apply the parameters to all of the returned traces in the _Script_ section.

**Timezones** can be automatically converted to the user's dashboard timezone by selecting the time column with the _Timezone correction_ option.

For example:

```javascript
let x = data.series[0].fields[0].values;
let y = data.series[0].fields[1].values;

// If you can reference your SQL column names, this might be easier
// let fields = Object.fromEntries(data.series[0].fields.map((x) => [x.name, x.values]));
// x, y = fields['time'], fields['data'] // where 'time' and 'data' are column names

// Switch from UTC to the dashboard time zone
x = matchTimezone(x);

let series = {
  x: x,
  y: y,
  name: variables.dash_var,
  // Where 'dash_var' is the name of
  // a Grafana dashboard variable
};

return {
  data: [ series ],
  config: {
    displayModeBar: false,
  },
};
```

## Screenshots

For screenshots see the `src/img` folder.
