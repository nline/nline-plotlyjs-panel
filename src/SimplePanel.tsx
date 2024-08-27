import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { PanelProps, dateTime } from '@grafana/data';
import { getTemplateSrv, locationService } from '@grafana/runtime';
import { SimpleOptions } from 'types';
import { processData, emptyData } from './dataUtils';
import { useScriptEvaluation } from './useScriptEvaluation';
import { useChartConfig } from './useChartConfig';
import { PlotlyChart } from './PlotlyChart';
import { ErrorDisplay } from './ErrorDisplay';
import { useTheme2 } from '@grafana/ui';

interface Props extends PanelProps<SimpleOptions> {
  onChangeTimeRange: (timeRange: { from: number; to: number }) => void;
}

export const SimplePanel: React.FC<Props> = ({
  options,
  data,
  width,
  height,
  timeZone,
  replaceVariables,
  title,
  onChangeTimeRange,
}) => {
  const plotRef = useRef<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const { evaluateScript, error: scriptError } = useScriptEvaluation();

  const processedData = useMemo(() => {
    try {
      return processData(data, timeZone, options.timeCol);
    } catch (e: any) {
      setError(e);
      return null;
    }
  }, [data, timeZone, options.timeCol]);

  const scriptVars = useMemo(() => {
    if (!processedData) {
      return null;
    }

    const templateSrv = getTemplateSrv();
    const dashboardVariables = templateSrv.getVariables().reduce((acc, v) => ({ ...acc, [v.name]: v }), {});

    const nativeVariables = {
      __from: data.timeRange.from.valueOf(),
      __to: data.timeRange.to.valueOf(),
      __interval: data.request?.interval,
      __interval_ms: data.request?.intervalMs,
      __timezone: timeZone,
      __timeFilter: (field: string) => {
        return templateSrv.replace(`$__timeFilter(${field})`, data.request?.scopedVars);
      },
      __dashboard: {
        uid: data.request?.dashboardUID,
        // Add other dashboard properties as needed
      },
    };

    const mergedVariables = { ...dashboardVariables, ...nativeVariables };

    return {
      data: processedData,
      variables: mergedVariables,
      options,
      utils: {
        timeZone,
        dayjs: require('dayjs'),
        matchTimezone: require('./dataUtils').matchTimezone,
        locationService,
        getTemplateSrv,
      },
    };
  }, [processedData, options, timeZone, data.timeRange, data.request]);

  const evaluatedScript = useMemo(() => {
    if (!scriptVars) {
      return null;
    }
    try {
      return evaluateScript(options.script, scriptVars);
    } catch (e: any) {
      // Don't set the error state here, let the scriptError from useScriptEvaluation handle it
      return null;
    }
  }, [options.script, scriptVars, evaluateScript]);

  const theme = useTheme2();
  const chartConfig = useChartConfig(options, evaluatedScript, replaceVariables, width, height, theme, data);

  useEffect(() => {
    // Clear errors when options or data change, but not scriptError
    setError(null);
  }, [options, data]);

  const handleEvent = useCallback(
    (event: { type: 'click' | 'select' | 'zoom'; data: any }) => {
      if (options.onclick && scriptVars) {
        const eventContext = {
          ...scriptVars,
          event,
        };
        try {
          evaluateScript(options.onclick, eventContext);
        } catch (e: any) {
          setError(e);
        }
      }

      if (options.syncTimeRange && event.type === 'zoom' && event.data['xaxis.range[0]'] && event.data['xaxis.range[1]']) {
        const from = dateTime(event.data['xaxis.range[0]']);
        const to = dateTime(event.data['xaxis.range[1]']);
        onChangeTimeRange({
          from: from.valueOf(),
          to: to.valueOf(),
        });
      }
    },
    [options.onclick, options.syncTimeRange, scriptVars, evaluateScript, onChangeTimeRange]
  );

  if (scriptError) {
    return (
      <ErrorDisplay
        message={{
          message: scriptError.message,
          lineNumber: scriptError.lineNumber,
          line: scriptError.line,
        }}
        title="Script Evaluation Error"
      />
    );
  }

  if (error) {
    return <ErrorDisplay message={error.message} title="Error" />;
  }

  const { isEmpty, message } = emptyData(chartConfig.data);

  if (!chartConfig || isEmpty) {
    return <ErrorDisplay message={message} title="Data Error" isNoData={true} />;
  }

  return (
    <PlotlyChart
      ref={plotRef}
      data={chartConfig.data}
      layout={chartConfig.layout}
      config={chartConfig.config}
      frames={chartConfig.frames}
      width={width}
      height={height}
      onEvent={handleEvent}
      title={title}
    />
  );
};
