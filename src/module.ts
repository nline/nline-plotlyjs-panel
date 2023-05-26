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
      .addBooleanSwitch({
        description: 'Whether to edit in YAML or JSON',
        path: 'yamlMode',
        name: 'Plotly mode',
        defaultValue: true,
      })
      .addNumberInput({
        description: 'Defined width of exported image',
        path: 'exportWidth',
        name: 'Exported image width',
      })
      .addNumberInput({
        description: 'Defined height of exported image',
        path: 'exportHeight',
        name: 'Exported image height',
      })
      .addNumberInput({
        description: 'Factor of exported image resolution',
        path: 'resScale',
        name: 'Exported resolution scale (may cause odd spacing)',
        defaultValue: 1,
      })
      .addCustomEditor({
        id: 'data',
        path: 'data',
        name: 'Data',
        description: 'Data object of the Plotly chart',
        editor: PanelOptionCode,
        category: ['Data'],
        settings: {
          language: defaults.yamlMode ? 'yaml' : 'json',
          initValue: defaults.data,
        },
        defaultValue: defaults.data,
      })
      .addCustomEditor({
        id: 'layout',
        path: 'layout',
        name: 'Layout',
        description: 'Layout object for the Plotly chart',
        editor: PanelOptionCode,
        category: ['Layout'],
        settings: {
          language: defaults.yamlMode ? 'yaml' : 'json',
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
          language: defaults.yamlMode ? 'yaml' : 'json',
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
            data, layout, config as f(data, variables){...your code...}`,
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
