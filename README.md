# Plotly Panel

[![Marketplace](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=marketplace&prefix=v&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22nline-plotlyjs-panel%22%29%5D.version&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/nline-plotlyjs-panel)
[![Downloads](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=downloads&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22nline-plotlyjs-panel%22%29%5D.downloads&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/nline-plotlyjs-panel)

Render charts with [Plotly.js](https://plotly.com/javascript/) in Grafana.

- Export plots image (with specified resolution and type)
- YAML/JSON support
- Automatic/manual timezone adjustment
- Apply `Data` configs across traces
- Expandable code editors
- Grafana variable substitution
- Robust error handling
- ... and more!

See the [changelog](./CHANGELOG.md) for what has changed in recent updates.

## Getting started

The Plotly Panel is [nLine's](https://nline.io) attempt to have a little bit more control over how we render our analyses in Grafana. It provides a component-based approach in constructing a Plotly panel. This way you can modify static elements independently without the need to interact with dynamically through JavaScript.

### Structure

The **data**, **layout**, and **config** fields are required objects described in [Plotly's documentation](https://plotly.com/javascript/plotlyjs-function-reference/). They must be structured [by this schema](https://raw.githubusercontent.com/plotly/plotly.js/master/dist/plot-schema.json). However, they can be parsed and interpreted as YAML or JSON for ease of use in development. These fields are consumed by Plotly as `{ data: [traces], layout: layout, config: config }` and produce a Plotly graph within the panel.

Data provided by the data source can be transformed via a user-defined script before being delivered to the Plotly chart. This `script` section includes a few implicit variables that can be used:

#### `data`

Data returned by the datasource query. See the example below for the object's schema.

#### `variables`

Object that contains [Grafana's dashboard variables](https://grafana.com/docs/grafana/latest/variables/) available in the current dashboard (user variables as well as a few global variables: `__from`, `__to`, `__interval` and `__interval_ms`).

#### `parameters`

The panel's data, layout, and config objects. This may be helpful in the case of applying static properties from the data panel (as one item rather than an array) across many traces via something like a merge.

#### `timeZone`

The dashboard timezone

#### `dayjs`

A [tiny timezone library](https://github.com/iamkun/dayjs)

#### `matchTimezone`

A convenience function to wrap around timeseries data to convert data to the user's timezone.

The script must return an object with one or more of the following properties:

- `data`
- `layout`
- `config`
- `frames`

**Note:** The `data` and `frames` properties are arrays of dictionaries/JSON and must begin with a dash (as per YAML specs) or added as an array in the return of the function. However, the "Cross-trace Data" field can be an object in which case it will apply the parameters to all of the returned traces in the _Script_ section. All objects get merged together with the script objects given priority. For example, `data` from script > `allData` > `data`.

**Timezones** can be automatically converted to the user's dashboard timezone by selecting the time column with the _Timezone correction_ option.

### Changes post Grafana 10:

> ⚠️ Prior to Grafana 10, the syntax to access the fields from the `data` variable was different. Use `data.series[0].fields[0].values.buffer`. Post 10, these arrays are stored without the `.buffer` property.

## Example script:

```javascript
// Get the first series
let series = data.series[0];
// For buffer needed for Grafana < 10
let x = series.fields[0].values.buffer || series.fields[0].values;
let y = series.fields[1].values.buffer || series.fields[1].values;

// If you can reference your SQL column names, this might be easier
// let fields = Object.fromEntries(data.series[0].fields.map((x) => [x.name, x.values]));
// x, y = fields['time'], fields['data'] // where 'time' and 'data' are column names

// Switch from UTC to the dashboard time zone or use "Timezone correction" and select the column
x = matchTimezone(x);

let series = {
  x: x,
  y: y,
  name: variables.dash_var,
  // Where 'dash_var' is the name of
  // a Grafana dashboard variable
};

return {
  data: [series],
  config: {
    displayModeBar: false,
  },
};
```

## Screenshots

For screenshots see the `src/img` folder.
