import { type Workflow, WorkflowImpl } from '../api/types';
import { flowState, type OpenedProjectInfo } from '../state/savedGraphs';
import { type GraphId } from '@ironclad/rivet-core';
import { useStableCallback } from './useStableCallback';
import { useLoadFlow } from './useLoadFlow';
import { useRecoilValue } from 'recoil';

export function useDuplicateFlow() {
  const loadFlow = useLoadFlow();
  const currentFlow = useRecoilValue(flowState);

  return useStableCallback((source?: Workflow, mainGraphId?: GraphId) => {
    const flow = WorkflowImpl.copy(source ?? currentFlow);
    const projectInfo: OpenedProjectInfo = {
      workflow: flow,
      openedGraph: mainGraphId,
    };
    loadFlow(projectInfo).catch(console.error);
  });
}
