# Plotly Panel

[![Marketplace](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=marketplace&prefix=v&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22nline-plotlyjs-panel%22%29%5D.version&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/nline-plotlyjs-panel)
[![Downloads](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=downloads&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22nline-plotlyjs-panel%22%29%5D.downloads&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/nline-plotlyjs-panel)

Render charts with [Plotly.js](https://plotly.com/javascript/) in Grafana.

## Features

- Export plots as images (with specified resolution and type)
- YAML/JSON support
- Dark/light theme support
- Automatic/manual timezone adjustment
- Apply `Data` configs across traces
- Expandable code editors
- Grafana variable substitution
- Robust error handling
- And more!

See the [changelog](./CHANGELOG.md) for recent updates.

## Getting Started

The Plotly Panel is [nLine's](https://nline.io) solution for enhanced control over rendering analyses in Grafana. It provides a component-based approach to constructing a Plotly panel, allowing you to modify static elements independently without interacting with them dynamically through JavaScript.

### Structure

The **data**, **layout**, and **config** fields are required objects as described in [Plotly's documentation](https://plotly.com/javascript/plotlyjs-function-reference/). They must be structured according to [this schema](https://raw.githubusercontent.com/plotly/plotly.js/master/dist/plot-schema.json). These fields can be parsed and interpreted as YAML or JSON for ease of development. Plotly consumes these fields as `{ data: [traces], layout: layout, config: config }` to produce a graph within the panel.

### Script Transformation

Data provided by the data source can be transformed via a user-defined script before being delivered to the Plotly chart. The `script` section includes several implicit variables:

- `data`: Data returned by the datasource query.
- `variables`: An object containing Grafana's dashboard variables and native variables.
- `options`: The panel's options, including data, layout, and config objects.
- `utils`: A set of utility functions and services.

#### Changes post Grafana 10:

> ⚠️ Prior to Grafana 10, the syntax to access the fields from the `data` variable was different. Use `data.series[0].fields[0].values.buffer`. Post 10, these arrays are stored without the `.buffer` property.

#### Context Variables

##### `variables`

This object contains [Grafana's dashboard variables](https://grafana.com/docs/grafana/latest/variables/) and native Grafana variables. Native variables take precedence over dashboard variables with the same name.

Native variables include:

- `__from` and `__to`: Start and end timestamps of the current time range.
- `__interval` and `__interval_ms`: The interval in string format (e.g., "1h") and in milliseconds.
- `__timezone`: The current dashboard timezone.
- `__timeFilter`: A function to generate time range filter expressions.
- `__dashboard`: The current dashboard object.

##### `utils`

The `utils` object provides several utility functions and services:

- `timeZone`: The dashboard timezone.
- `dayjs`: A [tiny timezone library](https://github.com/iamkun/dayjs).
- `matchTimezone`: A convenience function to convert timeseries data to the user's timezone.
- `locationService`: Grafana's location service for URL manipulation.
- `getTemplateSrv`: Grafana's template service for variable substitution.

### Return Value

The script must return an object with one or more of the following properties:

- `data`
- `layout`
- `config`
- `frames`

**Note:** The `data` and `frames` properties should be arrays of objects. The "Cross-trace Data" field can be an object, which will apply the parameters to all returned traces in the _Script_ section. Objects are merged with script objects given priority (e.g., `data` from script > `allData` > `data`).

### Example Script

```js
// Example: Basic timeseries plot
const { data, variables, options, utils } = arguments;
let series = data.series[0];
let x = series.fields[0];
let y = series.fields[1];

return {
  data: [
    {
      x: x.values || x.values.buffer,
      y: y.values || y.values.buffer,
      type: 'scatter',
      mode: 'lines',
      name: x.name,
    },
  ],
  layout: {
    xaxis: { title: x.name },
    yaxis: { title: y.name },
  },
};
```

### Event Handling

The panel also supports event handling for click, select, and zoom events. You can define a script to handle these events in the "On-event Trigger" section. The event object is passed as part of the `arguments` to the script.

Example event handling script:

```js
// Example: Event handling
const { data, variables, options, utils, event } = arguments;
try {
  const { type: eventType, data: eventData } = event;
  const { timeZone, dayjs, locationService, getTemplateSrv } = utils;

  switch (eventType) {
    case 'click':
      console.log('Click event:', eventData.points);
      break;
    case 'select':
      console.log('Selection event:', eventData.range);
      break;
    case 'zoom':
      console.log('Zoom event:', eventData);
      break;
    default:
      console.log('Unhandled event type:', eventType, eventData);
  }

  console.log('Current time zone:', timeZone);
  console.log('From time:', dayjs(variables.__from).format());
  console.log('To time:', dayjs(variables.__to).format());

} catch (error) {
  console.error('Error in onclick handler:', error);
}
```

## Screenshots

For screenshots, please see the `src/img` folder.
