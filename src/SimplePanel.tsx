import React from 'react';
import { PanelProps } from '@grafana/data';
import { getTemplateSrv, locationService } from '@grafana/runtime';
import { SimpleOptions, base } from 'types';
import { saveAs } from 'file-saver';
import Plotly, { toImage, Icons, PlotlyHTMLElement, Layout } from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import merge from 'deepmerge';
import _ from 'lodash';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

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

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel = React.memo(
  (props: Props) => {
    // Get all variables
    const { options, replaceVariables, width, height, timeZone } = props;

    // Image export for Plotly download issues
    let handleImageDownload = (gd: PlotlyHTMLElement) =>
      toImage(gd, {
        format: 'svg',
        width: options.exportWidth || width,
        height: options.exportHeight || height,
        scale: options.resScale,
      }).then((data: any) => saveAs(data, title));

    // Add convenience function for matching UTC data to timezone
    const tz = timeZone === 'browser' ? Intl.DateTimeFormat().resolvedOptions().timeZone : timeZone;
    const offset = dayjs().tz(tz).utcOffset() * 60 * 1000;
    const matchTimezone = (timeStamps: number[]) => {
      return timeStamps.map((ts: number) => ts - offset);
    };

    const context = {
      __from: replaceVariables('$__from'),
      __to: replaceVariables('$__to'),
      __interval: replaceVariables('$__interval'),
      __interval_ms: replaceVariables('$__interval_ms'),
    } as any;
    getTemplateSrv()
      .getVariables()
      .forEach((v: any) => {
        context[v.name] = v.current.text;
      });

    // Replace variables and use base data if empty
    let keys = ['allData', 'data', 'config', 'frames', 'script', 'onclick'];
    let [allData, data, config, frames, script, onclick] = keys.map((key) =>
      fmtValues((options as any)[key] ?? ((base as any)[key] || null), replaceVariables)
    );

    // Merge base layout styles
    let layout = fmtValues(merge(base.layout, options.layout ?? {}) as Partial<Layout>, replaceVariables);
    let title = replaceVariables(props.title);

    let parameters: any;
    parameters = { data: data, layout: layout, config: config };

    let lines: any;
    let known_err: any;
    try {
      if (props.options.script !== '' && props.data.state !== 'Error') {
        // What to pass into the script context
        const parameterValues = {
          data: props.data,
          variables: context,
          parameters,
          timeZone,
          dayjs,
          matchTimezone,
        };
        const f = new Function(...Object.keys(parameterValues), script);
        parameters = f(...Object.values(parameterValues));

        if (!parameters || typeof parameters === 'undefined') {
          known_err = true;
          throw new Error('Script must return values!');
        }
      } else if (props.options.script === '') {
        known_err = true;
        throw new Error('Please define a valid transformation within the Script Editor panel');
      }
    } catch (e: any) {
      if (!known_err) {
        let matches = e.stack.match(/anonymous>:.*\)/m) || e.stack.match(/Function:.*$/m);
        let match: any = matches ? matches[0].slice(0, -1) : null;

        lines = match ? match.split(':') : null;

        const msg = `Issue in Script:\n${e.toString()}${
          lines ? ` - line ${parseInt(lines[1], 10) - 2}:${lines[2]}` : ''
        }`;
        throw new Error(msg);
      } else {
        throw e;
      }
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
              Plotly.react(graphDiv, figure.data, figure.layout);
            }}
            useResizeHandler={true}
            onClick={(data) => {
              // What to pass into the onclick context
              const parameterValues = { data, locationService, getTemplateSrv };
              const f = new Function(...Object.keys(parameterValues), onclick);
              f(...Object.values(parameterValues));
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
