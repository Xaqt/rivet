import { serializeProject } from '@ironclad/rivet-core';
import { type Workflow } from '../api/types';
import { exportTextToFile } from '../io/utils';
import { slugify } from '../utils/string';

export function useExportFlow() {
    return (flow: Workflow) => {
      const serialized = serializeProject(flow.project) as string;
      const name = flow.name || flow.project.metadata.title || 'flow';
      const fileName = `${slugify(name)}.yaml`;
      exportTextToFile(serialized, fileName, 'application/x-yaml');
    };
}
