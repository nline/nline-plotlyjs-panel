import React, { useMemo } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { CodeEditor } from '@grafana/ui';
import './panel.css';
const { ResizableBox } = require('react-resizable');
const YAML = require('js-yaml');

interface Props extends StandardEditorProps<string, any, any, any> {}

export const PanelOptionCode: React.FC<Props> = React.memo(({ value, item, onChange, context }) => {
  const { options } = context;
  const yaml = options?.yamlMode ?? false;
  const { language } = item.settings ?? {};

  const formattedValue = useMemo(() => {
    if (typeof value !== 'string') {
      const initValue = item.settings?.initValue ?? null;
      return yaml ? YAML.dump(initValue, null, 2) : JSON.stringify(initValue, null, 2);
    }
    return value === 'null' ? null : value;
  }, [value, item.settings, yaml]);

  const handleBlur = (code: string) => {
    const newValue = language === 'yaml' || language === 'json' ? YAML.load(code) : code;
    onChange(newValue);
  };

  return (
    <ResizableBox
      height={300}
      minConstraints={[200, 200]}
      maxConstraints={[800, 800]}
      resizeHandles={['se', 's', 'sw']}
    >
      <CodeEditor
        language={language}
        showLineNumbers={language === 'javascript'}
        value={formattedValue}
        onBlur={handleBlur}
      />
    </ResizableBox>
  );
});

PanelOptionCode.displayName = 'PanelOptionCode';
