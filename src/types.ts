export interface SimpleOptions {
  title: string;
  layout: object;
  config: object;
  data: any[];
  frames: any[];
  script: string;
  onclick: string;
}

export type EditorCodeType = string | undefined;
export type EditorLanguageType = 'javascript' | 'html' | 'json' | undefined;

export const defaults: SimpleOptions = {
  title: 'title',
  layout: {
    font: {
      color: 'darkgrey',
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: {
      t: 5,
      r: 20,
      b: 40,
      l: 40,
    },
    xaxis: {
      type: 'date',
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
      mode: 'lines',
      line: { color: 'red', width: 1 },
    },
  ],
  frames: [],
  script: `console.log(data);
var trace = {
  x: data.series[0].fields[0].values.buffer,
  y: data.series[0].fields[1].values.buffer
};
  
return {data:[trace]};`,
  onclick: `// console.log(data);
// window.updateVariables({query:{'var-project':'test'}, partial: true})`,
};
