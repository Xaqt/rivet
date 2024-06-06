import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';
import { type WorkflowsFilter, WorkflowSortFields } from '../api/types';

const { persistAtom } = recoilPersist({
  key: 'ui',
});

export const debuggerPanelOpenState = atom({
  key: 'debuggerPanelOpenState',
  default: false,
});

export type OverlayKey = 'promptDesigner' | 'trivet' | 'chatViewer' | 'dataStudio' | 'plugins' | 'community';

export const overlayOpenState = atom<OverlayKey | undefined>({
  key: 'overlayOpenState',
  default: undefined,
});

export const newProjectModalOpenState = atom({
  key: 'newProjectModalOpenState',
  default: false,
});

export const expandedFoldersState = atom<Record<string, boolean>>({
  key: 'expandedFoldersState',
  default: {},
  effects: [persistAtom],
});

export const helpModalOpenState = atom<boolean>({
  key: 'helpModalOpenState',
  default: false,
});

export const projectSavedState = atom<boolean>({
  key: 'projectSavedState',
  default: false,
});

const { persistAtom: workflowFilterStateAtom } = recoilPersist({
  key: 'workflowFilterState'
});

export const workflowFilterState = atom<WorkflowsFilter>({
  key: 'workflowFilterState',
  default: {
    workspace_id: '', // todo:
    page: 1,
    page_size: 20,
    order_by: WorkflowSortFields.name,
    order: 'ASC'
  },
  effects: [workflowFilterStateAtom],
});
