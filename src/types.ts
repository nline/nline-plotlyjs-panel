export interface SimpleOptions {
  yamlMode: boolean;
  exportWidth: number | null;
  exportHeight: number | null;
  resScale: number;
  title: string;
  layout: object;
  config: object;
  data: any;
  frames: any[];
  script: string;
  onclick: string;
}

export type EditorCodeType = string | undefined;

export type EditorLanguageType = 'javascript' | 'html' | 'json' | 'yaml' | undefined;

export const defaults: SimpleOptions = {
  yamlMode: true,
  exportWidth: null,
  exportHeight: null,
  resScale: 2,
  title: 'Plotly panel',
  layout: {
    font: {
      family: 'Inter, Helvetica, Arial, sans-serif',
      color: 'rgb(25,27,31)',
    },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    hoverlabel: {
      bgcolor: 'white',
    },
    margin: {
      t: 30,
      r: 30,
      b: 30,
      l: 30,
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
  },
  config: {},
  data: [
    {
      type: 'scatter',
      mode: 'lines',
      line: { color: 'red' },
      hovertext: 'Point from red trace',
    },
    {
      type: 'scatter',
      mode: 'lines',
      line: { color: 'blue' },
      hovertext: 'Point from blue trace',
    },
  ],
  frames: [],
  script: `let x = data.series[0].fields[0].values;
let y = data.series[0].fields[1].values;

let trace1 = {
  x: x,
  y: y
};
let trace2 = {
  x: x,
  y: y.map(x => x * 1.1)
};

return { data: [trace1, trace2] };`,
  onclick: `// console.log(data);
// window.updateVariables({query:{'var-project':'test'}, partial: true})`,
};
