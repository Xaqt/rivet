import { useSetRecoilState } from 'recoil';
import { type OpenedProjectInfo, loadedProjectState, flowState } from '../state/savedGraphs.js';
import { emptyNodeGraph, getError } from '@ironclad/rivet-core';
import { graphState } from '../state/graph.js';
import { useSetStaticData } from './useSetStaticData';
import { toast } from 'react-toastify';
import { graphNavigationStackState } from '../state/graphBuilder';
import { WorkflowImpl } from '../api/types';

export function useLoadFlow() {
  const setFlowState = useSetRecoilState(flowState);
  const setLoadedProjectState = useSetRecoilState(loadedProjectState);
  const setGraphData = useSetRecoilState(graphState);
  const setStaticData = useSetStaticData();
  const setNavigationStack = useSetRecoilState(graphNavigationStackState);

  return async (projectInfo: OpenedProjectInfo) => {
    try {
      setFlowState(projectInfo.workflow || new WorkflowImpl());
      setNavigationStack({ stack: [], index: undefined });
      const project = projectInfo.workflow.project;

      if (projectInfo.openedGraph) {
        const graphData = project.graphs[projectInfo.openedGraph];
        if (graphData) {
          setGraphData(graphData);
        } else {
          setGraphData(emptyNodeGraph());
        }
      } else {
        setGraphData(emptyNodeGraph());
      }

      if (project.data) {
        await setStaticData(project.data);
      }

      setLoadedProjectState({
        id: project.metadata.id,
        loaded: true,
      });
    } catch (err) {
      toast.error(`Failed to load project: ${getError(err).message}`);
    }
  };
}
