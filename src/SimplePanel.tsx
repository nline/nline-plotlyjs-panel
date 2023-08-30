import React from 'react';
import { PanelProps } from '@grafana/data';
import { getTemplateSrv, locationService } from '@grafana/runtime';
import { SimpleOptions, base } from 'types';
import { saveAs } from 'file-saver';
import Plotly, { toImage, Icons, PlotlyHTMLElement, Layout } from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import merge from 'deepmerge';
import _ from 'lodash';

const combineMerge = (target: any, source: any, options: any) => {
  const destination = target.slice();
  source.forEach((item: any, index: any) => {
    if (typeof destination[index] === 'undefined') {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options);
    } else if (options.isMergeableObject(item)) {
      destination[index] = merge(target[index], item, options);
    } else if (target.indexOf(item) === -1) {
      destination.push(item);
    }
  });

  return destination;
};

const fmtValues = (data: any, transformFn: (value: string) => string): any => {
  if (Array.isArray(data)) {
    return _.map(data, (item) => fmtValues(item, transformFn));
  } else if (typeof data === 'object' && data !== null) {
    return _.mapValues(data, (value) => fmtValues(value, transformFn));
  } else if (typeof data === 'string') {
    return transformFn(data);
  }
  return data;
};

const emptyData = (data: any) => {
  return data.every((obj: any) => obj !== null && obj.hasOwnProperty('series') && obj.series.length === 0);
};

const Plot = createPlotlyComponent(Plotly);

let templateSrv = getTemplateSrv();

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel = React.memo(
  (props: Props) => {
    // Get all variables
    const { options, replaceVariables, width, height } = props;

    const context = {
      __from: replaceVariables('$__from'),
      __to: replaceVariables('$__to'),
      __interval: replaceVariables('$__interval'),
      __interval_ms: replaceVariables('$__interval_ms'),
    } as any;
    templateSrv.getVariables().forEach((v: any) => {
      context[v.name] = v.current.text;
    });

    // Fixes Plotly download issues
    const handleImageDownload = (gd: PlotlyHTMLElement) =>
      toImage(gd, {
        format: 'png',
        width: options.exportWidth || width,
        height: options.exportHeight || height,
        scale: options.resScale,
      }).then((data: any) => saveAs(data, title));

    // Pick base if not specified in options
    let {
      allData = fmtValues(options.allData ?? base.allData, replaceVariables),
      data = fmtValues(options.data ?? base.data, replaceVariables),
      config = fmtValues(options.config ?? base.config, replaceVariables),
      frames = fmtValues(options.frames ?? base.frames, replaceVariables),
    } = options;
    // Merge base layout styles
    let layout = fmtValues(merge(base.layout, options.layout ?? {}) as Partial<Layout>, replaceVariables);
    let title = replaceVariables(props.title);

    let parameters: any;
    parameters = { data: data, layout: layout, config: config };

    let lines: any;
    try {
      if (props.options.script !== '' && props.data.state !== 'Error') {
        let f = new Function('data, variables, parameters', options.script);
        parameters = f(props.data, context, parameters);
        if (!parameters || typeof parameters === 'undefined') {
          let e = new Error('Script must return values!');
          throw e;
        }
      } else if (props.options.script === '') {
        return (
          <div>
            <p>
              Please define a valid transformation within the <b>Script Editor</b> panel.
            </p>
          </div>
        );
      }
    } catch (e: any) {
      let matches = e.stack.match(/anonymous>:.*\)/m);
      lines = matches ? matches[0].slice(0, -1).split(':') : null;
      console.log(props);
      return (
        <div>
          <p>There&apos;s an error in your script:</p>
          <p>
            <code style={{ color: '#D00' }}>
              {e.toString()} {lines ? `- line ${parseInt(lines[1], 10) - 2}:${lines[2]}` : ''}
            </code>
          </p>
          <p>Check your console for more details</p>
        </div>
      );
    }

    // Set defaults
    layout = { ...layout, autosize: true, height: height };
    config = {
      ...config,
      modeBarButtonsToAdd: [
        {
          name: 'toImageGrafana',
          title: 'Export plot as an image',
          icon: Icons.camera,
          click: handleImageDownload,
        },
      ],
      modeBarButtonsToRemove: ['toImage'],
      displaylogo: false,
    };

    // Apply allData to all traces
    data = parameters.data ? merge(data, parameters.data, { arrayMerge: combineMerge }) : data;
    if (allData != null && data != null) {
      if (Array.isArray(data)) {
        data = data.map((any: any) => merge(allData, any, { arrayMerge: (_, sourceArray) => sourceArray }));
      }
    }

    return (
      <div>
        {emptyData(data) ? (
          <div style={{ display: 'flex', position: 'fixed', height: '100%', width: '100%', justifyContent: 'center' }}>
            <h4 style={{ margin: 'auto 1em' }}>No data in selected range or source</h4>
          </div>
        ) : (
          <Plot
            style={{ width: '100%', height: '100%' }}
            data={data}
            frames={parameters.frames ? merge(frames, parameters.frames, { arrayMerge: combineMerge }) : frames}
            layout={parameters.layout ? merge(layout, parameters.layout) : layout}
            config={parameters.config ? merge(config, parameters.config) : config}
            onInitialized={(figure, graphDiv) => {
              const updatedLayout = merge(figure.layout, { autosize: true, height: height });
              Plotly.react(graphDiv, figure.data, updatedLayout);
            }}
            useResizeHandler={true}
            onClick={(data) => {
              const f = new Function('data', 'locationService', 'getTemplateSrv', options.onclick);
              f(data, locationService, getTemplateSrv);
            }}
          />
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only render on these conditions
    const memoFields = ['options', 'width', 'height', 'data', 'timeRange', 'timeZone', 'title'];
    return (memoFields as Array<keyof Props>).every((prop) => _.isEqual(prevProps[prop], nextProps[prop]));
  }
);

SimplePanel.displayName = 'SimplePanel';
