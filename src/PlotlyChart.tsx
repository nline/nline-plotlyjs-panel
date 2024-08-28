import React, { useCallback, forwardRef, useEffect, useRef, useMemo } from 'react';
import Plotly, { toImage } from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import { saveAs } from 'file-saver';
import { ScopedVars } from '@grafana/data';

interface ExtendedConfig extends Partial<Plotly.Config> {
  imgFormat?: 'png' | 'jpeg' | 'webp' | 'svg';
  exportWidth?: number | null;
  exportHeight?: number | null;
  resScale?: number;
}

interface PlotlyChartProps {
  data: any[];
  layout: Partial<Plotly.Layout>;
  config: ExtendedConfig;
  frames?: Plotly.Frame[];
  width: number;
  height: number;
  onEvent?: (event: { type: 'click' | 'select' | 'zoom'; data: any }) => void;
  title: string;
  replaceVariables: (value: string, scopedVars?: ScopedVars, format?: string | Function) => string;
}

const Plot: React.ComponentType<any> = createPlotlyComponent(Plotly);

export const PlotlyChart = forwardRef<any, PlotlyChartProps>(
  ({ data, layout, config, frames, width, height, onEvent, title, replaceVariables }, ref) => {
    const latestConfigRef = useRef(config);

    useEffect(() => {
      latestConfigRef.current = config;
    }, [config]);

    const processedTitle = useMemo(() => {
      const replacedTitle = replaceVariables(title);
      return replacedTitle.replace(/\./g, '');
    }, [title, replaceVariables]);

    const handleImageDownload = useCallback(() => {
      const plotlyElement = (ref as React.RefObject<any>)?.current?.el;
      if (plotlyElement) {
        const currentLayout = plotlyElement.layout;
        const currentConfig = latestConfigRef.current;

        const exportConfig = {
          format: currentConfig.imgFormat || 'png',
          width: currentConfig.exportWidth || currentLayout.width,
          height: currentConfig.exportHeight || currentLayout.height,
          scale: currentConfig.resScale || 2,
        };

        toImage(plotlyElement, exportConfig).then((data) => saveAs(data, `${processedTitle}.${exportConfig.format}`));
      }
    }, [ref, processedTitle]);

    const updatedConfig = useMemo(
      () => ({
        ...config,
        modeBarButtonsToAdd: [
          {
            name: 'toImageGrafana',
            title: 'Export plot as an image',
            icon: Plotly.Icons.camera,
            click: handleImageDownload,
          },
        ],
        modeBarButtonsToRemove: ['toImage'] as Plotly.ModeBarDefaultButtons[],
        displaylogo: false,
      }),
      [config, handleImageDownload]
    );

    return (
      <Plot
        ref={ref}
        data={data}
        layout={{ ...layout, width, height }}
        config={updatedConfig}
        frames={frames}
        useResizeHandler={true}
        style={{ width: `${width}px`, height: `${height}px` }}
        onClick={(clickData: any) =>
          onEvent?.({
            type: 'click',
            data: clickData,
          })
        }
        onSelected={(selectData: any) =>
          onEvent?.({
            type: 'select',
            data: selectData,
          })
        }
        onRelayout={(relayoutData: any) => {
          if (relayoutData['xaxis.range[0]'] || relayoutData['yaxis.range[0]']) {
            onEvent?.({
              type: 'zoom',
              data: relayoutData,
            });
          }
        }}
      />
    );
  }
);

PlotlyChart.displayName = 'PlotlyChart';
