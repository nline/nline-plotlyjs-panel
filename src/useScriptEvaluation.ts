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
      const lines = script.split('\n');
      let lineNumber = e.lineNumber || e.stack?.split('\n')[1]?.match(/:<(\d+):\d+>/)?.[1] || 'unknown';
      if (typeof lineNumber === 'number' && lineNumber > 2) {
        lineNumber -= 2;
      }
      setError({
        message: e.message,
        lineNumber,
        line: lines[lineNumber - 1] || '',
      });
      return null;
    }
  }, []);

  return { evaluateScript, error, setError };
};
