// @ts-ignore
import packageJSON from '../../../web-app/package.json' assert { type: 'json' };

export function useCurrentVersion() {
  return packageJSON.version;
}
