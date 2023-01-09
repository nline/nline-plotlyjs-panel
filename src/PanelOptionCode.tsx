// Code from https://github.com/gapitio/gapit-htmlgraphics-panel
import React from 'react';
import { StandardEditorProps } from '@grafana/data';
import { CodeEditor } from '@grafana/ui';
import { Resizable } from 're-resizable';
import './panel.css';

const YAML = require('js-yaml');

interface Props extends StandardEditorProps<string, any, any> {}

export const PanelOptionCode: React.FC<Props> = ({ value, item, onChange }) => {
  if (typeof value !== 'string') {
    value = YAML.dump(value, null, 2);
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
        value={value === 'null' ? YAML.dump(item.settings?.initValue, null, 2) : value}
        onBlur={(code) => {
          if (item.settings?.language === 'yaml' && code) {
            try {
              code = YAML.load(code);
            } catch (e: any) {
              console.error(e.message);
            }
          }
          onChange(code);
        }}
      />
    </Resizable>
  );
};
