import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";
import { type FindWorkflowsDto, type Workflow } from '../api/types';

const { persistAtom: flowSearchPersistAtom } = recoilPersist({ key: 'flow-search' });

export const workflowSearchCriteriaState = atom<FindWorkflowsDto>({
  key: "workflowSearchCriteriaState",
  default: {
    workspace_id: "", // todo
    page: 1,
    page_size: 20,
    order_by: "created_at",
    order: "desc"
  },
  effects: [flowSearchPersistAtom],
});

export const workflowLoadingState = atom<boolean>({
  key: "workflowLoadingState",
  default: false
});

export const workflowListState = atom<Workflow[]>({
  key: "workflowListState",
  default: []
});

const currentWorkflowState = atom<string | undefined>({
  key: "currentWorkflowState",
  default: undefined
});
