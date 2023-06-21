import { PanelPlugin } from '@grafana/data';
import { SimpleOptions, inits, base } from './types';
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
        name: 'Plotly mode',
        description: 'Whether to edit in YAML or JSON',
        path: 'yamlMode',
        defaultValue: true,
      })
      .addNumberInput({
        name: 'Exported image width',
        description: 'Defined width of exported image',
        path: 'exportWidth',
      })
      .addNumberInput({
        name: 'Exported image height',
        description: 'Defined height of exported image',
        path: 'exportHeight',
      })
      .addNumberInput({
        name: 'Exported resolution scale',
        description: 'Factor of exported image resolution (may cause odd spacing)',
        path: 'resScale',
        defaultValue: 2,
      })
      .addCustomEditor({
        id: 'allData',
        path: 'allData',
        name: 'Cross-trace Data',
        description: 'Data props applied across all traces on the Plotly chart (object)',
        editor: PanelOptionCode,
        category: ['Data Editor'],
        settings: {
          editorHeight: 150,
          language: inits.yamlMode ? 'yaml' : 'json',
          baseValue: base.allData,
          initValue: inits.allData,
        },
        defaultValue: inits.allData,
      })
      .addCustomEditor({
        id: 'data',
        path: 'data',
        name: 'Data',
        description: 'Data object of the Plotly chart (array)',
        editor: PanelOptionCode,
        category: ['Data Editor'],
        settings: {
          editorHeight: 150,
          language: inits.yamlMode ? 'yaml' : 'json',
          baseValue: base.data,
          initValue: inits.data,
        },
        defaultValue: inits.data,
      })
      .addCustomEditor({
        id: 'layout',
        path: 'layout',
        name: 'Layout',
        description: 'Layout object for the Plotly chart (defaults are applied as base)',
        editor: PanelOptionCode,
        category: ['Layout Editor'],
        settings: {
          language: inits.yamlMode ? 'yaml' : 'json',
          baseValue: base.layout,
          initValue: inits.layout,
        },
        defaultValue: inits.layout,
      })
      .addCustomEditor({
        id: 'config',
        path: 'config',
        name: 'Configuration',
        description: 'Configuration object for the Plotly chart',
        editor: PanelOptionCode,
        category: ['Config Editor'],
        settings: {
          editorHeight: 150,
          language: inits.yamlMode ? 'yaml' : 'json',
          baseValue: base.config,
          initValue: inits.config,
        },
        defaultValue: inits.config,
      })
      .addCustomEditor({
        id: 'script',
        path: 'script',
        name: 'Processing Script',
        description: `
          Script executed whenever new data is available.
          Must return an object with one or more of the following properties:
          data, layout, config, frames as f(data, variables){...}`,
        editor: PanelOptionCode,
        category: ['Script Editor'],
        settings: {
          language: 'javascript',
        },
        defaultValue: inits.script,
      })
      .addCustomEditor({
        id: 'onclick',
        path: 'onclick',
        name: 'On-click Trigger',
        description: `
          Script executed when chart is clicked.
          \`f(data){...}\``,
        editor: PanelOptionCode,
        category: ['On-click Editor'],
        settings: {
          language: 'javascript',
        },
        defaultValue: inits.onclick,
      });
  });
