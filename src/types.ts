export interface SimpleOptions {
  yamlMode: boolean;
  exportWidth: number | null;
  exportHeight: number | null;
  resScale: number;
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

export type EditorLanguageType = 'javascript' | 'html' | 'json' | 'yaml' | undefined;

const defaultLayout = {
  font: {
    family: 'Inter, Helvetica, Arial, sans-serif',
    color: 'rgb(25,27,31)',
  },
  paper_bgcolor: 'white',
  plot_bgcolor: 'white',
  hoverlabel: {
    bgcolor: 'white',
  },
  xaxis: {
    type: 'date',
    autorange: true,
    automargin: true,
  },
  yaxis: {
    automargin: true,
    autorange: true,
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
  yamlMode: true,
  exportWidth: null,
  exportHeight: null,
  resScale: 2,
  title: 'Plotly panel',
  allData: {},
  data: [],
  layout: defaultLayout,
  config: {},
  frames: [],
  script: `\
// let x = data.series[0].fields[0].values;
// let y = data.series[0].fields[1].values;
// let trace = { x: x, y: y };
// return { data: [trace] };
return {}
  `,
  onclick: `\
// console.log(data);
// locationService.partial({ 'var-example': 'test' }, true);
  `,
};
