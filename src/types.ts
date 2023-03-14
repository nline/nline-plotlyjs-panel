export interface SimpleOptions {
  yamlMode: boolean;
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
  resScale: 1,
  title: 'Plotly panel',
  layout: {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: {
      t: 5,
      r: 20,
      b: 40,
      l: 20,
    },
    yaxis: {
      automargin: true,
      autorange: true,
    },
  },
  config: {
    displayModeBar: false,
  },
  data: [
    {
      type: 'scatter',
      mode: 'markers',
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
  script: `let x = data.series[0].fields[0].values.buffer;
let y = data.series[0].fields[1].values.buffer;

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
