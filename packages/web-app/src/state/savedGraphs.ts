import { DefaultValue, atom, atomFamily, selector } from 'recoil';
import { nanoid } from 'nanoid/non-secure';
import { produce } from 'immer';
import {
  type DataId,
  type GraphId,
  type NodeGraph,
  type Project,
  type ProjectId,
  type DataValue,
} from '@ironclad/rivet-core';
import { recoilPersist } from 'recoil-persist';
import { entries, values } from '../../../core/src/utils/typeSafety';
// eslint-disable-next-line import/no-cycle
import { WorkflowImpl, type Workflow } from '../api/types';

const { persistAtom } = recoilPersist({ key: 'flows' });

export const genId = <T>(): T => nanoid(16) as T;

const newProject = (): Project => {
  return {
    graphs: {},
    metadata: {
      id: genId<ProjectId>(),
      title: 'Untitled Project',
      description: '',
    },
    plugins: [],
  };
};

export const flowState = atom<Workflow>({
  key: 'flowState',
  default: new WorkflowImpl(),
  effects: [persistAtom],
});

// What's the data of the last loaded project?
export const projectState = selector({
  key: 'projectState',
  get: ({ get }) => {
    return get(flowState).project;
  },
  set: ({ set }, newValue) => {
    set(flowState, (oldValue) => {
      return {
        ...oldValue,
        project: newValue instanceof DefaultValue ? newProject() : newValue,
      };
    });
  },
});

export const projectDataState = atom<Record<DataId, string> | undefined>({
  key: 'projectDataState',
  default: undefined,
});

export const projectMetadataState = selector({
  key: 'projectMetadataState',
  get: ({ get }) => {
    return get(projectState).metadata;
  },
  set: ({ set }, newValue) => {
    set(projectState, (oldValue) => {
      return {
        ...oldValue,
        metadata: newValue instanceof DefaultValue ? newProject().metadata : newValue,
      };
    });
  },
});

export const projectGraphInfoState = selector({
  key: 'projectGraphInfoState',
  get: ({ get }) => {
    const project = get(projectState);
    return {
      graphs: Object.fromEntries(
        entries(project.graphs).map(([id, graph]) => [
          id,
          {
            id,
            name: graph.metadata!.name,
            description: graph.metadata!.description,
          },
        ]),
      ),
      metadata: project.metadata,
    };
  },
});

export type OpenedProjectInfo = {
  openedGraph?: GraphId;
  workflow: Workflow;
};

// Which project was loaded last and where is it?
export const loadedProjectState = atom<{
  loaded: boolean;
  saved?: boolean;
  id?: string,
  openedGraph?: string,
}>({
  key: 'loadedProjectState',
  default: {
    loaded: false,
    saved: false,
  },
  effects: [persistAtom],
});

export const savedGraphsState = selector<NodeGraph[]>({
  key: 'savedGraphsState',
  get: ({ get }) => {
    const project = get(projectState);
    return values(project.graphs);
  },
  set: ({ set, get }, newValue) => {
    if (newValue instanceof DefaultValue) {
      return;
    }

    const project = get(projectState);
    const newProject = produce(project, (draft) => {
      draft.graphs = {};
      for (const graph of newValue) {
        if (graph.metadata == null) {
          graph.metadata = {
            id: genId<GraphId>(),
            name: 'Untitled Graph',
            description: '',
          };
        } else if (graph.metadata.id == null) {
          graph.metadata.id = genId() as GraphId;
        }

        draft.graphs[graph.metadata!.id!] = graph;
      }
    });

    set(projectState, newProject);
  },
});

export const projectPluginsState = selector({
  key: 'projectPluginsState',
  get: ({ get }) => {
    return get(projectState).plugins ?? [];
  },
  set: ({ set }, newValue) => {
    set(projectState, (oldValue) => {
      return {
        ...oldValue,
        plugins: newValue instanceof DefaultValue ? newProject().plugins : newValue,
      };
    });
  },
});

/** Project context values stored in the IDE and not in the project file. Available in Context nodes. */
export type ProjectContext = Record<
  string,
  {
    value: DataValue;
    secret: boolean;
  }
>;

export const projectContextState = atomFamily<ProjectContext, ProjectId>({
  key: 'projectContext',
  default: {},
  effects: [persistAtom],
});
