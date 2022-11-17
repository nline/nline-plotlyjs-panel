import { PanelPlugin } from '@grafana/data';
import { SimpleOptions, defaults } from './types';
// Import an entire module for side effects only, without importing anything.
// This runs the module's global code, but doesn't actually import any values.
// It sets the global variable for Plotly before loading plotly.js
import 'utils';

import { SimplePanel } from './SimplePanel';
import { PanelOptionCode } from './PanelOptionCode';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel)
  .setDataSupport({ annotations: true })
  .setPanelOptions((builder) => {
    return builder
      .addCustomEditor({
        id: 'data',
        path: 'data',
        name: 'Data',
        description: 'Data object of the Plotly chart',
        editor: PanelOptionCode,
        category: ['Data'],
        settings: {
          language: 'yaml',
          initValue: defaults.data,
        },
        defaultValue: defaults.data,
      })
      .addCustomEditor({
        id: 'layout',
        path: 'layout',
        name: 'Layout',
        description: 'Layout object for the Plotly chart ',
        editor: PanelOptionCode,
        category: ['Layout'],
        settings: {
          language: 'yaml',
          initValue: defaults.layout,
        },
        defaultValue: defaults.layout,
      })
      .addCustomEditor({
        id: 'config',
        path: 'config',
        name: 'Configuration',
        description: 'Configuration object for the Plotly chart',
        editor: PanelOptionCode,
        category: ['Config'],
        settings: {
          language: 'yaml',
          initValue: defaults.config,
        },
        defaultValue: defaults.config,
      })
      .addCustomEditor({
        id: 'script',
        path: 'script',
        name: 'Script',
        description: `
            Script executed whenever new data is available.
            Must return an object with one or more of the following properties:
            data, layout, config as
            f(data, variables){...your code...}`,
        editor: PanelOptionCode,
        category: ['Script'],
        settings: {
          language: 'javascript',
        },
        defaultValue: defaults.script,
      })
      .addCustomEditor({
        id: 'onclick',
        path: 'onclick',
        name: 'Click',
        description: `
            Script executed when chart is clicked.
            f(data){...your code...}`,
        editor: PanelOptionCode,
        category: ['Click'],
        settings: {
          language: 'javascript',
        },
        defaultValue: defaults.onclick,
      });
  });
