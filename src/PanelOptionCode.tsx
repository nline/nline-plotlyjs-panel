// Code from https://github.com/gapitio/gapit-htmlgraphics-panel
import React from 'react';
import { StandardEditorProps } from '@grafana/data';
import { CodeEditor } from '@grafana/ui';
import { Resizable } from 're-resizable';
import './panel.css';

interface Props extends StandardEditorProps<string, any, any> {}

export const PanelOptionCode: React.FC<Props> = ({ value, item, onChange }) => {
  if (typeof value !== 'string') {
    value = JSON.stringify(value, null, 2);
  }

  return (
    <Resizable
      defaultSize={{
        width: '100%',
        height: '300px',
      }}
      enable={{
        top: true,
        bottom: true,
      }}
    >
      <CodeEditor
        language={item.settings?.language}
        showLineNumbers={item.settings?.language === 'javascript' ? true : false}
        value={value === 'null' ? JSON.stringify(item.settings?.initValue, null, 2) : value}
        onBlur={(code) => {
          if (item.settings?.language === 'json' && code) {
            code = JSON.parse(code);
          }
          onChange(code);
        }}
      />
    </Resizable>
  );
};
