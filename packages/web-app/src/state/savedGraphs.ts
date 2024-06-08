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
import { blankProject } from '../utils/blankProject.js';
import { recoilPersist } from 'recoil-persist';
import { entries, values } from '../../../core/src/utils/typeSafety';
import { Workflow, WorkflowImpl } from '../api/types';

const { persistAtom } = recoilPersist({ key: 'flows' });

export const UNSAVED_PATH_KEY = '__unsaved__';

const genId = (): string => nanoid(16);

export const flowState = atom<Workflow>({
  key: 'flowState',
  default: new WorkflowImpl(),
  effects: [persistAtom],
});

// What's the data of the last loaded project?
export const projectState = atom<Omit<Project, 'data'>>({
  key: 'projectState',
  default: {
    metadata: {
      id: genId() as ProjectId,
      description: '',
      title: 'Untitled Project',
    },
    graphs: {},
    plugins: [],
  },
  effects: [persistAtom],
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
        metadata: newValue instanceof DefaultValue ? blankProject().metadata : newValue,
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

// Which project file was loaded last and where is it?
export const loadedProjectState = atom<{
  path: string;
  loaded: boolean;
  saved?: boolean;
  id?: string,
}>({
  key: 'loadedProjectState',
  default: {
    path: '',
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
            id: genId() as GraphId,
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
        plugins: newValue instanceof DefaultValue ? blankProject().plugins : newValue,
      };
    });
  },
});

export type OpenedProjectInfo = {
  fsPath?: string | null,
  id?: ProjectId;
  openedGraph?: GraphId;
  project: Project,
  workflow?: Workflow;
};

export type OpenedProjectsInfo = {
  openedProjects: Record<ProjectId, OpenedProjectInfo>;
  openedProjectsSortedIds: ProjectId[];
};

export const projectsState = atom<OpenedProjectsInfo>({
  key: 'projectsState',
  default: {
    openedProjects: {},
    openedProjectsSortedIds: [],
  },
  effects: [persistAtom],
});

export const openedProjectsState = selector({
  key: 'openedProjectsState',
  get: ({ get }) => {
    return get(projectsState).openedProjects;
  },
  set: ({ set }, newValue) => {
    set(projectsState, (oldValue) => {
      return {
        ...oldValue,
        openedProjects: newValue instanceof DefaultValue ? {} : newValue,
      };
    });
  },
});

export const openedProjectsSortedIdsState = selector({
  key: 'openedProjectsSortedIdsState',
  get: ({ get }) => {
    return get(projectsState).openedProjectsSortedIds;
  },
  set: ({ set }, newValue) => {
    set(projectsState, (oldValue) => {
      return {
        ...oldValue,
        openedProjectsSortedIds: newValue instanceof DefaultValue ? [] : newValue,
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
