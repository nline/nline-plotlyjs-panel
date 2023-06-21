import React from 'react';
import { StandardEditorProps } from '@grafana/data';
import { CodeEditor } from '@grafana/ui';
import './panel.css';
const { ResizableBox } = require('react-resizable');
const YAML = require('js-yaml');

interface Props extends StandardEditorProps<string, any, any, any> {}

export const PanelOptionCode: React.FC<Props> = React.memo(({ value, item, onChange, context }) => {
  const yaml = context?.options?.yamlMode ?? false;
  const language = item?.settings?.language;
  const height = item?.settings?.editorHeight || 300;

  const handleBlur = (code: string) => {
    const newValue = language === 'yaml' || language === 'json' ? YAML.load(code) : code;
    onChange(newValue);
  };

  const content = typeof value === 'string' ? value : yaml ? YAML.dump(value, null, 2) : JSON.stringify(value, null, 2);
  const defaultValue = yaml
    ? YAML.dump(item?.settings?.initValue, null, 2)
    : JSON.stringify(item?.settings?.initValue, null, 2);

  return (
    <ResizableBox
      height={height}
      minConstraints={[100, 100]}
      maxConstraints={[800, 800]}
      resizeHandles={['se', 's', 'sw']}
    >
      <CodeEditor
        language={language}
        showLineNumbers={language === 'javascript'}
        value={value === 'null' ? defaultValue : content}
        onBlur={handleBlur}
      />
    </ResizableBox>
  );
});

PanelOptionCode.displayName = 'PanelOptionCode';
