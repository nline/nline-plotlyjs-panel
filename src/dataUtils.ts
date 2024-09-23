import { PanelData } from '@grafana/data';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import merge from 'deepmerge';
import _ from 'lodash';

dayjs.extend(utc);
dayjs.extend(timezone);

export const matchTimezone = (timeStamps: number[], timeZone: string): number[] => {
  const local = dayjs.tz.guess();
  const tz = timeZone === 'browser' ? local : timeZone;
  const localOffset = dayjs().tz(local).utcOffset();
  const dashOffset = dayjs().tz(tz).utcOffset();

  const offset = (localOffset - dashOffset) * 60 * 1000;
  return timeStamps.map((ts) => ts - offset);
};

export const processData = (data: PanelData, timeZone: string, timeCol?: string) => {
  if (!data.series || data.series.length === 0) {
    return data;
  }

  const correctedSeries = data.series.map((series) => {
    const fields = series.fields.map((field) => {
      if (field.name === timeCol) {
        return {
          ...field,
          values: matchTimezone(field.values, timeZone),
        };
      }
      return field;
    });
    return { ...series, fields };
  });

  return { ...data, series: correctedSeries };
};

export const combineMerge = (target: any, source: any, options: any) => {
  const destination = target.slice();
  source.forEach((item: any, index: any) => {
    if (typeof destination[index] === 'undefined') {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options);
    } else if (options.isMergeableObject(item)) {
      destination[index] = merge(target[index], item, options);
    } else if (target.indexOf(item) === -1) {
      destination.push(item);
    }
  });
  return destination;
};

export const fmtValues = (data: any, transformFn: (value: string) => string): any => {
  if (Array.isArray(data)) {
    return _.map(data, (item) => fmtValues(item, transformFn));
  } else if (typeof data === 'object' && data !== null) {
    return _.mapValues(data, (value) => fmtValues(value, transformFn));
  } else if (typeof data === 'string') {
    return transformFn(data);
  }
  return data;
};

export const emptyData = (data: any): { isEmpty: boolean; message: string } => {
  if (!Array.isArray(data) || data.length === 0) {
    return { isEmpty: true, message: 'Data is empty or not an array of traces' };
  }

  for (const trace of data) {
    if (typeof trace === 'object' && trace !== null && Object.keys(trace).length > 0) {
      // Check if any property in the trace has a non-null value
      for (const key in trace) {
        if (trace[key] !== null && trace[key] !== undefined) {
          return { isEmpty: false, message: 'Data contains non-empty traces' };
        }
      }
    }
  }

  return { isEmpty: true, message: 'All traces are empty' };
};
