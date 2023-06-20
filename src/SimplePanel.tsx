import React from 'react';
import { PanelProps } from '@grafana/data';
import { getTemplateSrv, locationService } from '@grafana/runtime';
import { SimpleOptions, defaults } from 'types';
import { saveAs } from 'file-saver';
import Plotly, { toImage, Icons, PlotlyHTMLElement } from 'plotly.js-dist-min';
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

const transformValues = (data: any, transformFn: (value: string) => string): any => {
  if (Array.isArray(data)) {
    return _.map(data, (item) => transformValues(item, transformFn));
  } else if (typeof data === 'object' && data !== null) {
    return _.mapValues(data, (value) => transformValues(value, transformFn));
  } else if (typeof data === 'string') {
    return transformFn(data);
  }
  return data;
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

    // Pick either options or defaults, but for layout, merge
    let { config = defaults.config, data = defaults.data, frames = defaults.frames } = options;
    let layout = { ...defaults.layout, ...options.layout };

    // Replace variables with Grafana vars is applicable
    layout = transformValues(layout, replaceVariables);
    config = transformValues(config, replaceVariables);
    data = transformValues(data, replaceVariables);
    frames = transformValues(frames, replaceVariables);
    const title = replaceVariables(props.title);

    // Fixes Plotly download issues
    const handleImageDownload = (gd: PlotlyHTMLElement) =>
      toImage(gd, {
        format: 'png',
        width: options.exportWidth || width,
        height: options.exportHeight || height,
        scale: options.resScale,
      }).then((data: any) => saveAs(data, title));

    let parameters: any;
    parameters = { data: data, layout: layout, config: config };

    let lines: any;
    let error: any;
    try {
      if (props.options.script !== '' && props.data.state !== 'Error') {
        let f = new Function('data, variables, parameters', options.script);
        parameters = f(props.data, context, parameters);
        if (!parameters || typeof parameters === 'undefined') {
          throw new Error('Script must return values!');
        }
      }
    } catch (e) {
      // Can't update chart when script is changing
      error = e;
      let matches = error.stack.match(/anonymous>:.*\)/m);
      lines = matches ? matches[0].slice(0, -1).split(':') : null;
      console.error(e);
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

    // Convert data to array if not an array
    if (data.constructor === Object) {
      if (parameters.data.constructor === Array) {
        // Data parameters applied to all traces
        data = Array(parameters.data.length).fill(data);
      }
    }

    return (
      <div>
        {error ? (
          <div>
            <p>There&apos;s an error in your script:</p>
            <p>
              <code style={{ color: '#D00' }}>
                {error.toString()} {lines ? `- line ${parseInt(lines[1], 10) - 2}:${lines[2]}` : ''}
              </code>
            </p>
            <p>Check your console for more details</p>
          </div>
        ) : Array.isArray(data) && data.every((obj) => obj.hasOwnProperty('series') && obj.series.length === 0) ? (
          <div style={{ display: 'flex', position: 'fixed', height: '100%', width: '100%', justifyContent: 'center' }}>
            <h4 style={{ margin: 'auto 1em' }}>No data in selected range or source</h4>
          </div>
        ) : (
          <Plot
            style={{ width: '100%', height: '100%' }}
            data={parameters.data ? merge(data, parameters.data, { arrayMerge: combineMerge }) : data}
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
    return (
      _.isEqual(prevProps.options, nextProps.options) &&
      _.isEqual(prevProps.width, nextProps.width) &&
      _.isEqual(prevProps.height, nextProps.height) &&
      _.isEqual(prevProps.data, nextProps.data) &&
      _.isEqual(prevProps.timeRange, nextProps.timeRange)
    );
  }
);

SimplePanel.displayName = 'SimplePanel';
