import React from 'react';
import { Alert, useStyles2 } from '@grafana/ui';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

interface ErrorDisplayProps {
  message: string | { message: string; lineNumber: string | number; line: string };
  title?: string;
  isNoData?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, title = 'Error', isNoData = false }) => {
  const styles = useStyles2(getStyles);

  if (isNoData) {
    return (
      <div className={styles.noDataContainer}>
        <h4>No data</h4>
        <p>{typeof message === 'string' ? message : message.message}</p>
      </div>
    );
  }

  const errorContent =
    typeof message === 'string' ? (
      message
    ) : (
      <>
        <p>Error on line {message.lineNumber}: <i>{message.message}</i></p>
        <pre>{message.line}</pre>
      </>
    );

  return (
    <Alert title={title} severity="error">
      {errorContent}
    </Alert>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  noDataContainer: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: ${theme.colors.text.secondary};
  `,
});
