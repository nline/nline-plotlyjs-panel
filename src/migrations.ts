import { PanelModel } from '@grafana/data';
import { SimpleOptions } from './types';

export const plotlyPanelMigrationHandler = (panel: PanelModel<SimpleOptions>): Partial<SimpleOptions> => {
  const options: any = panel.options || {};

  // Migrate old script variables to new structure
  if (options.script) {
    options.script = migrateScriptVariables(options.script);
  }

  // Migrate onclick script if it exists
  if (options.onclick) {
    options.onclick = migrateScriptVariables(options.onclick);
  }

  return options;
};

const migrateScriptVariables = (script: string): string => {
  // Replace old variable names with new ones
  const replacements: Array<[RegExp, string]> = [
    [/\bparameters\b/g, 'options'],
    [/\btimeZone\b/g, 'utils.timeZone'],
    [/\bdayjs\b/g, 'utils.dayjs'],
    [/\bmatchTimezone\b/g, 'utils.matchTimezone'],
    [/\blocationService\b/g, 'utils.locationService'],
    [/\bgetTemplateSrv\b/g, 'utils.getTemplateSrv'],
  ];

  let migratedScript = script;
  for (const [oldVar, newVar] of replacements) {
    migratedScript = migratedScript.replace(oldVar, newVar);
  }

  return migratedScript;
};
