export interface SimpleOptions {
  imgFormat: 'svg' | 'png' | 'jpeg' | 'webp';
  exportWidth: number | null;
  exportHeight: number | null;
  resScale: number;
  timeCol: string;
  syncTimeRange: boolean;
  title: string;
  allData: object;
  data: any[];
  layout: object;
  config: object;
  frames: any[];
  script: string;
  onclick: string;
}

export interface SimpleBase {
  allData: object;
  data: any[];
  layout: object;
  config: object;
  frames: any[];
}

export type EditorCodeType = string | undefined;

export type EditorLanguageType = 'javascript' | 'html' | 'yaml' | undefined;

const defaultLayout = {
  font: {
    family: 'Inter, Helvetica, Arial, sans-serif',
  },
  xaxis: {
    type: 'date',
    autorange: true,
    automargin: true,
  },
  yaxis: {
    autorange: true,
    automargin: true,
  },
  title: {
    automargin: true,
  },
  margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 0,
  },
};

// Defaults that Plotly falls back to
export const base: SimpleBase = {
  allData: {},
  data: [],
  layout: defaultLayout,
  config: {},
  frames: [],
};

// Defaults that Plotly begins with as an example
export const inits: SimpleOptions = {
  imgFormat: 'png',
  exportWidth: null,
  exportHeight: null,
  resScale: 2,
  timeCol: '',
  syncTimeRange: true,
  title: 'Plotly panel',
  allData: {},
  data: [],
  layout: defaultLayout,
  config: {},
  frames: [],
  script: `\
// Basic timeseries plot
/*
// 'data', 'variables', 'options', and 'utils' are passed as arguments

let series = data.series[0];
let x = series.fields[0];
let y = series.fields[1];

return {
  data: [{
    x: x.values || x.values.buffer,
    y: y.values || y.values.buffer,
    type: 'scatter',
    mode: 'lines',
    name: x.name
  }],
  layout: {
    xaxis: { title: x.name },
    yaxis: { title: y.name }
  }
}
*/
return {}
  `,
  onclick: `\
// Event handling
/*
// 'data', 'variables', 'options', 'utils', and 'event' are passed as arguments

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

  // Example of using locationService
  // locationService.partial({ 'var-example': 'test' }, true);

} catch (error) {
  console.error('Error in onclick handler:', error);
}
*/
  `,
};
