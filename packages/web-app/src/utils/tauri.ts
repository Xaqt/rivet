import { type RivetPlugin, type Settings, type StringPluginConfigurationSpec } from '@ironclad/rivet-core';
import { entries } from '../../../core/src/utils/typeSafety';

export function isInTauri(): boolean {
  return false;
}

const cachedEnvVars: Record<string, string> = {};

export async function getEnvVar(name: string): Promise<string | undefined> {
  if (cachedEnvVars[name]) {
    return cachedEnvVars[name];
  }

  // vite ???
  if (typeof process !== 'undefined') {
    return process.env[name];
  }

  return undefined;
}

export async function fillMissingSettingsFromEnvironmentVariables(settings: Partial<Settings>, plugins: RivetPlugin[]) {
  const fullSettings: Settings = {
    ...settings,
    openAiKey: (settings.openAiKey || (await getEnvVar('OPENAI_API_KEY'))) ?? '',
    openAiOrganization: (settings.openAiOrganization || (await getEnvVar('OPENAI_ORG_ID'))) ?? '',
    openAiEndpoint: (settings.openAiEndpoint || (await getEnvVar('OPENAI_ENDPOINT'))) ?? '',
    pluginSettings: settings.pluginSettings,
    pluginEnv: {},
  };

  for (const plugin of plugins) {
    const stringConfigs = entries(plugin.configSpec ?? {}).filter(([, c]) => c.type === 'string') as [
      string,
      StringPluginConfigurationSpec,
    ][];
    for (const [configName, config] of stringConfigs) {
      if (config.pullEnvironmentVariable) {
        const envVarName =
          typeof config.pullEnvironmentVariable === 'string'
            ? config.pullEnvironmentVariable
            : config.pullEnvironmentVariable === true
              ? configName
              : undefined;
        if (envVarName) {
          const envVarValue = await getEnvVar(envVarName);
          if (envVarValue) {
            fullSettings.pluginEnv![envVarName] = envVarValue;
          }
        }
      }
    }
  }

  return fullSettings;
}
