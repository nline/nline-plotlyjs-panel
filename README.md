# Plotly Panel for Grafana

![Marketplace](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=marketplace&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins%2Fnline-plotlyjs-panel&query=%24.version)
![Downloads](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=downloads&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins%2Fnline-plotlyjs-panel&query=%24.downloads)


Create advanced, interactive charts in Grafana using [Plotly.js](https://plotly.com/javascript/).

## Key Features

- Flexible chart creation with full Plotly.js capabilities
- YAML/JSON support for easy configuration
- Dark/light theme compatibility
- Automatic and manual timezone adjustment
- Cross-trace data application
- Expandable code editors for customization
- Grafana variable integration
- Comprehensive error handling
- High-resolution image export in multiple formats (SVG, PNG, JPEG, WebP)

For a complete list of recent updates, please refer to our [changelog](https://github.com/nline/nline-plotlyjs-panel/blob/main/CHANGELOG.md).

## Getting Started

The Plotly Panel, developed by [nLine](https://nline.io), offers enhanced control over data visualization in Grafana. It uses a component-based approach, allowing you to modify chart elements independently without complex JavaScript interactions.

### Panel Structure

The panel configuration consists of five main components:

1. **allData**: Applied across all traces on the Plotly chart
2. **data**: Defines the chart's data series (traces)
3. **layout**: Controls the chart's appearance and axes
4. **config**: Sets chart-wide options
5. **frames**: (Optional) For animated charts

These components follow the [Plotly.js schema](https://raw.githubusercontent.com/plotly/plotly.js/master/dist/plot-schema.json). You can configure them using YAML or JSON in the panel options.

### Data Transformation

You can transform your data before rendering using a custom script. The script has access to:

- `data`: Raw data from your Grafana data source
- `variables`: Grafana dashboard and system variables
- `options`: Current panel configuration
- `utils`: Helper functions (e.g., timezone conversion, dayjs for date manipulation)

#### Context Variables

The script has access to several context variables that provide useful information and functionality:

##### `variables`

This object contains [Grafana's dashboard variables](https://grafana.com/docs/grafana/latest/variables/) and native Grafana variables. Native variables take precedence over dashboard variables with the same name.

Key native variables include:

- `__from` and `__to`: Start and end timestamps of the current time range
- `__interval` and `__interval_ms`: The interval in string format (e.g., "1h") and in milliseconds
- `__timezone`: The current dashboard timezone
- `__timeFilter`: A function to generate time range filter expressions
- `__dashboard`: The current dashboard object

##### `utils`

The `utils` object provides several utility functions and services to assist with data manipulation and panel interactions:

- `timeZone`: The dashboard timezone
- `dayjs`: A lightweight [date manipulation library](https://github.com/iamkun/dayjs)
- `matchTimezone`: A convenience function to convert timeseries data to the user's timezone
- `locationService`: Grafana's location service for URL manipulation
- `getTemplateSrv`: Grafana's template service for variable substitution
- `replaceVariables`: A function to substitute Grafana variables in strings

### Processing Script

The script must return an object that defines the chart configuration. This object can include one or more of the following properties:

- `data`: An array of trace objects defining the chart's data series
- `layout`: An object controlling the chart's appearance and axes
- `config`: An object setting chart-wide options
- `frames`: An array of frame objects for animated charts

**Note:** The `data` and `frames` properties should be arrays of objects. The "Cross-trace Data" field can be an object, which will apply the parameters to all returned traces in the _Script_ section. Objects are merged with script objects given priority (e.g., `data` from script > `allData` > `data`).

The script is defined in the "Processing Script" editor.

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

### On-click Event Handling

The panel supports click, select, and zoom events. You can define custom behavior for these events using the "On-event Trigger" editor.

```javascript
// Event handling
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
}
```

## Screenshots

For screenshots, please see the `src/img` folder.
