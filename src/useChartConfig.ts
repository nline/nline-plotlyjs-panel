import merge from 'deepmerge';
import { useMemo } from 'react';
import { SimpleOptions, base } from './types';
import { fmtValues, combineMerge } from './dataUtils';

export const useChartConfig = (
  options: SimpleOptions,
  evaluatedScript: any,
  replaceVariables: (str: string) => string,
  width: number,
  height: number,
  theme: any,
  data: any
) => {
  return useMemo(() => {
    const textColor = theme.colors.text.primary;
    const backgroundColor = theme.colors.background.primary;
    const altbackgroundColor = theme.colors.background.secondary;

    const themedLayout = {
      font: {
        color: textColor,
      },
      paper_bgcolor: backgroundColor,
      plot_bgcolor: backgroundColor,
      hoverlabel: {
        bgcolor: textColor,
      },
      xaxis: {
        gridcolor: altbackgroundColor,
      },
      yaxis: {
        gridcolor: altbackgroundColor,
      },
    };

    const mergedLayout = merge(themedLayout, options.layout ?? {});
    let layout = fmtValues(mergedLayout, replaceVariables);

    let data = fmtValues(options.data ?? base.data, replaceVariables);
    let config = fmtValues(options.config ?? base.config, replaceVariables);
    let frames = fmtValues(options.frames ?? base.frames, replaceVariables);

    if (evaluatedScript) {
      data = evaluatedScript.data ? merge(data, evaluatedScript.data, { arrayMerge: combineMerge }) : data;
      layout = evaluatedScript.layout ? merge(layout, evaluatedScript.layout) : layout;
      config = evaluatedScript.config ? merge(config, evaluatedScript.config) : config;
      frames = evaluatedScript.frames ? merge(frames, evaluatedScript.frames, { arrayMerge: combineMerge }) : frames;
    }

    if (options.allData != null && data != null) {
      if (Array.isArray(data)) {
        data = data.map((item: any) => merge(options.allData, item, { arrayMerge: (_, sourceArray) => sourceArray }));
      }
    }

    return { data, layout, config, frames };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, evaluatedScript, replaceVariables, width, height, theme, data]);
};
