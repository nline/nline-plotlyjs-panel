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

interface ErrorMessageProps {
  message: string;
  line?: number | null;
  code?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, line, code = true }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100%',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    {code ? (
      <>
        <h4 style={{ textAlign: 'center' }}>Issue in script {line ? ` (line ${line})` : ''}</h4>
        <code>{message}</code>
      </>
    ) : (
      <h4 style={{ textAlign: 'center' }}>{message}</h4>
    )}
  </div>
);

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

interface Props extends PanelProps<SimpleOptions>, Record<string, any> {}

export const SimplePanel = React.memo(
  (props: Props) => {
    // Get all variables
    const { options, replaceVariables, width, height, timeZone } = props;
    let issueMsg = '';
    let issueLine: number | null = null;

    // Image export for Plotly download issues
    let handleImageDownload = (gd: PlotlyHTMLElement) =>
      toImage(gd, {
        format: options.imgFormat,
        width: options.exportWidth || width,
        height: options.exportHeight || height,
        scale: options.resScale,
      }).then((data) => saveAs(data, title));

    // Add convenience function for matching UTC data to timezone
    const local = dayjs.tz.guess();
    const matchTimezone = (timeStamps: Int32Array) => {
      const tz = timeZone === 'browser' ? local : timeZone;
      const localOffset = dayjs().tz(local).utcOffset();
      const dashOffset = dayjs().tz(tz).utcOffset();

      // We need to reverse the offset that Plotly assigns
      // And then consider the dashboard timezone offset
      const offset = (localOffset - dashOffset) * 60 * 1000;
      return timeStamps.map((ts) => ts - offset);
    };

    // Column timezone drop down to select time
    const correctTimeCol = (data: any) => {
      let cloneData = _.cloneDeep(data);
      let d = cloneData.series[0].fields;
      let index = d.findIndex((f: any) => f.name === options.timeCol);

      if (index !== -1) {
        cloneData.series[0].fields[index].values = matchTimezone(d[index].values);
        return cloneData;
      }
    };

    // Convert time column if selected
    let prcData = props.data;
    const timeColExists = prcData.series?.[0]?.fields?.some((f) => f.name === options.timeCol) || false;
    if (timeColExists) {
      prcData = correctTimeCol(props.data);
    }

    const context = {
      __from: replaceVariables('$__from'),
      __to: replaceVariables('$__to'),
      __interval: replaceVariables('$__interval'),
      __interval_ms: replaceVariables('$__interval_ms'),
    } as any;
    getTemplateSrv()
      .getVariables()
      .forEach((v: any) => {
        context[v.name] = v;
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
      if (props.options.script !== '' && prcData.state !== 'Error') {
        // What to pass into the script context
        const parameterValues = {
          data: prcData,
          variables: context,
          parameters,
          timeZone,
          dayjs,
          matchTimezone,
        };
        const f = new Function(...Object.keys(parameterValues), script);
        parameters = f(...Object.values(parameterValues));

        if (!parameters || typeof parameters === 'undefined') {
          issueMsg = 'Script must return values!';
          return <ErrorMessage message={issueMsg} />;
        }
      } else if (props.options.script === '') {
        issueMsg = 'Please define a valid transformation within the Script Editor panel';
        return <ErrorMessage message={issueMsg} />;
      }
    } catch (e: any) {
      console.log(e);

      let matches = e.stack.match(/anonymous>:.*\)/m) || e.stack.match(/Function:.*$/m);
      let match: any = matches ? matches[0].slice(0, -1) : null;
      lines = match ? match.split(':') : null;

      issueLine = lines ? parseInt(lines[1], 10) - 2 : null;
      issueMsg = e.toString();
      return <ErrorMessage message={issueMsg} line={issueLine} />;
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

    if (emptyData(data)) {
      issueMsg = 'No data in selected range or source';
      return <ErrorMessage message={issueMsg} code={false} />;
    }

    return (
      <>
        (
        <Plot
          divId="plot"
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
        )
      </>
    );
  },
  (prevProps: Props, nextProps: Props) => {
    // Only render on these conditions
    const memoFields = ['options', 'width', 'height', 'data', 'timeRange', 'timeZone', 'title'] as any[];
    return memoFields.every((prop) => _.isEqual(prevProps[prop], nextProps[prop]));
  }
);

SimplePanel.displayName = 'SimplePanel';
