import React, { useCallback, useState, useMemo } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { CodeEditor, Alert } from '@grafana/ui';
import './panel.css';
const { ResizableBox } = require('react-resizable');
const YAML = require('js-yaml');

interface Props extends StandardEditorProps<string, any, any, any> {}

export const PanelOptionCode: React.FC<Props> = React.memo(({ value, item, onChange, context }) => {
  const language = item?.settings?.language;
  const height = item?.settings?.editorHeight || 300;

  const [originalText, setOriginalText] = useState(typeof value === 'string' ? value : YAML.dump(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleBlur = useCallback(
    (code: string) => {
      setOriginalText(code);
      setError(null);
      if (language === 'yaml') {
        try {
          const parsedValue = YAML.load(code);
          onChange(parsedValue);
        } catch (error: any) {
          setError(`Invalid YAML: ${error.message}`);
          onChange(code);
        }
      } else {
        onChange(code);
      }
    },
    [language, onChange]
  );

  const monacoOptions = useMemo(
    () => ({
      minimap: { enabled: false },
      lineNumbers: 'on' as const,
      folding: true,
      renderValidationDecorations: 'on' as const,
    }),
    []
  );

  return (
    <>
      <ResizableBox
        height={height}
        minConstraints={[100, 100]}
        maxConstraints={[800, 800]}
        resizeHandles={['se', 's', 'sw']}
      >
        <CodeEditor language={language} value={originalText} onBlur={handleBlur} monacoOptions={monacoOptions} />
      </ResizableBox>
      {error && (
        <Alert title="Error" severity="error">
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{error}</pre>
        </Alert>
      )}
    </>
  );
});

PanelOptionCode.displayName = 'PanelOptionCode';
