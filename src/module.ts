import { SimpleOptions, inits, base } from './types';
import { PanelPlugin, FieldOverrideContext, getFieldDisplayName } from '@grafana/data';
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
      .addSelect({
        name: 'Image format',
        description: 'File type of exported image',
        settings: {
          options: [
            { value: 'svg', label: 'SVG' },
            { value: 'png', label: 'PNG' },
            { value: 'jpeg', label: 'JPG' },
            { value: 'webp', label: 'WebP' },
          ],
        },
        path: 'imgFormat',
        defaultValue: 'png',
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
      .addSelect({
        name: 'Timezone correction',
        description: 'Time column used to correct data received by Plotly into the correct timezone',
        path: 'timeCol',
        defaultValue: '',
        settings: {
          allowCustomValue: true,
          options: [],
          getOptions: async (context: FieldOverrideContext) => {
            const options = [
              { value: '', label: 'No correction' },
            ];
            if (context && context.data) {
              for (const frame of context.data) {
                for (const field of frame.fields) {
                  const name = getFieldDisplayName(field, frame, context.data);
                  const value = name;
                  options.push({ value, label: name });
                }
              }
            }
            return Promise.resolve(options);
          },
        },
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
          data, layout, config, frames: f(data, variables){...}`,
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
          Script executed when chart is clicked: f(data){...}`,
        editor: PanelOptionCode,
        category: ['On-click Editor'],
        settings: {
          language: 'javascript',
        },
        defaultValue: inits.onclick,
      });
  });
