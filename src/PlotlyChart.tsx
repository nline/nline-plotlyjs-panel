import React, { useCallback, forwardRef } from 'react';
import Plotly, { toImage } from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import { saveAs } from 'file-saver';

const Plot: React.ComponentType<any> = createPlotlyComponent(Plotly);

interface ExtendedConfig extends Partial<Plotly.Config> {
  imgFormat?: 'png' | 'jpeg' | 'webp' | 'svg';
  resScale?: number;
}

interface PlotlyChartProps {
  data: any[];
  layout: Partial<Plotly.Layout>;
  config: ExtendedConfig;
  frames?: Plotly.Frame[];
  width: number;
  height: number;
  onClick?: (data: any) => void;
  title: string;
}

export const PlotlyChart = forwardRef<any, PlotlyChartProps>(
  ({ data, layout, config, frames, width, height, onClick, title }, ref) => {
    const getCurrentDimensions = useCallback(() => {
      const { clientWidth, clientHeight } = (ref as React.RefObject<any>)?.current?.el ?? {};
      return { width: clientWidth ?? width, height: clientHeight ?? height };
    }, [ref, width, height]);

    const handleImageDownload = useCallback(() => {
      const { width: currentWidth, height: currentHeight } = getCurrentDimensions();
      const refElement = (ref as React.RefObject<any>)?.current?.el;
      toImage(refElement, {
        format: config.imgFormat || 'png',
        width: currentWidth,
        height: currentHeight,
        scale: config.resScale || 2,
      }).then((data) => saveAs(data, `${title}.${config.imgFormat || 'png'}`));
    }, [config, title, getCurrentDimensions, ref]);

    const updatedConfig: ExtendedConfig = {
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
    };

    return (
      <Plot
        ref={ref}
        data={data}
        layout={{ ...layout, width, height }}
        config={updatedConfig}
        frames={frames}
        useResizeHandler={true}
        style={{ width: `${width}px`, height: `${height}px` }}
        onClick={onClick}
      />
    );
  }
);

PlotlyChart.displayName = 'PlotlyChart';
