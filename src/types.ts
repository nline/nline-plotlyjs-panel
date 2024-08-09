export interface SimpleOptions {
  imgFormat: 'svg' | 'png' | 'jpeg' | 'webp';
  exportWidth: number | null;
  exportHeight: number | null;
  resScale: number;
  timeCol: string;
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
  title: 'Plotly panel',
  allData: {},
  data: [],
  layout: defaultLayout,
  config: {},
  frames: [],
  script: `\
// let series = data.series[0];
// let x = series.fields[0].values.buffer || series.fields[0].values;
//let y = series.fields[1].values.buffer || series.fields[1].values;
// let trace = { x: x, y: y };
// return { data: [trace] };
return {}
  `,
  onclick: `\
// console.log(data);
// locationService.partial({ 'var-example': 'test' }, true);
  `,
};
