import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { PanelProps } from '@grafana/data';
import { getTemplateSrv, locationService } from '@grafana/runtime';
import { SimpleOptions } from 'types';
import { processData, emptyData } from './dataUtils';
import { useScriptEvaluation } from './useScriptEvaluation';
import { useChartConfig } from './useChartConfig';
import { PlotlyChart } from './PlotlyChart';
import { ErrorDisplay } from './ErrorDisplay';
import { useTheme2 } from '@grafana/ui';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, timeZone, replaceVariables, title }) => {
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

  const scriptContext = useMemo(() => {
    if (!processedData) {
      return null;
    }
    return {
      data: processedData,
      variables: getTemplateSrv()
        .getVariables()
        .reduce((acc, v) => ({ ...acc, [v.name]: v }), {}),
      parameters: options,
      timeZone,
      dayjs: require('dayjs'),
      matchTimezone: require('./dataUtils').matchTimezone,
    };
  }, [processedData, options, timeZone]);

  const evaluatedScript = useMemo(() => {
    if (!scriptContext) {
      return null;
    }
    try {
      return evaluateScript(options.script, scriptContext);
    } catch (e: any) {
      // Don't set the error state here, let the scriptError from useScriptEvaluation handle it
      return null;
    }
  }, [options.script, scriptContext, evaluateScript]);

  const theme = useTheme2();
  const chartConfig = useChartConfig(options, evaluatedScript, replaceVariables, width, height, theme, data);

  useEffect(() => {
    // Clear errors when options or data change, but not scriptError
    setError(null);
  }, [options, data]);

  const handleClick = useCallback(
    (clickData: any) => {
      if (options.onclick && scriptContext) {
        const clickContext = {
          ...scriptContext,
          data: clickData,
          locationService,
          getTemplateSrv,
        };
        try {
          evaluateScript(options.onclick, clickContext);
        } catch (e: any) {
          setError(e);
        }
      }
    },
    [options.onclick, scriptContext, evaluateScript]
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
      onClick={handleClick}
      title={title}
    />
  );
};
