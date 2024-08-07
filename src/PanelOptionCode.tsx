import React, { useCallback, useMemo } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { CodeEditor } from '@grafana/ui';
import { ErrorDisplay } from './ErrorDisplay';
import './panel.css';
const { ResizableBox } = require('react-resizable');
const YAML = require('js-yaml');

interface Props extends StandardEditorProps<string, any, any, any> {}

export const PanelOptionCode: React.FC<Props> = React.memo(({ value, item, onChange, context }) => {
  const yaml = context?.options?.yamlMode ?? false;
  const language = item?.settings?.language;
  const height = item?.settings?.editorHeight || 300;

  const handleBlur = useCallback(
    (code: string) => {
      try {
        const newValue = language === 'yaml' || language === 'json' ? YAML.load(code) : code;
        onChange(newValue);
      } catch (error) {
        onChange(code);
      }
    },
    [language, onChange]
  );

  const content = useMemo(() => {
    try {
      return typeof value === 'string' ? value : yaml ? YAML.dump(value, null, 2) : JSON.stringify(value, null, 2);
    } catch (error) {
      return String(value);
    }
  }, [value, yaml]);

  const defaultValue = useMemo(() => {
    try {
      return yaml ? YAML.dump(item?.settings?.initValue, null, 2) : JSON.stringify(item?.settings?.initValue, null, 2);
    } catch (error) {
      return String(item?.settings?.initValue);
    }
  }, [yaml, item?.settings?.initValue]);

  if (!language) {
    return <ErrorDisplay message="Language not specified for code editor" />;
  }

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
