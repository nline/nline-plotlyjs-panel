import { useState, useCallback } from 'react';

export const useScriptEvaluation = () => {
  const [error, setError] = useState<{ message: string; lineNumber: number | string; line: string } | null>(null);

  const evaluateScript = useCallback((script: string, context: any) => {
    try {
      const f = new Function(...Object.keys(context), script);
      const result = f(...Object.values(context));

      // Validate the result
      if (result && typeof result === 'object' && 'data' in result) {
        if (!Array.isArray(result.data)) {
          throw new Error("The 'data' property must be an array");
        }
      }

      setError(null); // Clear the error when successful
      return result;
    } catch (e: any) {
      let lineNumber: any = 'unknown';
      let line = '';

      const lines = script.split('\n');
      if (e.stack) {
        // Try to match line numbers for both Chrome and Firefox
        const match = e.stack.match(/:(\d+):\d+/);
        if (match) {
          lineNumber = parseInt(match[1], 10);
          // Adjust for the function wrapper
          lineNumber = Math.max(1, lineNumber - 2);
          line = lines[lineNumber - 1];
        }
      }

      setError({
        message: e.message,
        lineNumber,
        line: line,
      });
      return null;
    }
  }, []);

  return { evaluateScript, error, setError };
};
