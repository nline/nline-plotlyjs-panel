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
      l: 20,
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
      mode: 'markers',
      marker: {
        maxdisplayed: 200,
      },
      line: { color: 'red', width: 2 },
      hovertext: 'Point from red trace',
    },
    {
      type: 'scatter',
      mode: 'lines',
      line: { color: 'blue', width: 2 },
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
