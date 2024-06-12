import { useRecoilState, useRecoilValue } from 'recoil';
import { flowState, loadedProjectState, projectState } from '../state/savedGraphs.js';
import { useSaveCurrentGraph } from './useSaveCurrentGraph.js';
import { produce } from 'immer';
import { toast } from 'react-toastify';
import { useWorkflows } from './useWorkflows';
import { type WorkflowCreateDto } from '../api/types';
import { workspaceState } from '../state/auth';

export function useSaveFlow() {
  const saveGraph = useSaveCurrentGraph();
  const currentWorkspace = useRecoilValue(workspaceState);
  const [flow, setFlow] = useRecoilState(flowState);
  const project = useRecoilValue(projectState);
  const [loadedProject, setLoadedProject] = useRecoilState(loadedProjectState);
  const { createWorkflow, updateWorkflow } = useWorkflows();

  async function saveFlow() {
    if (!loadedProject.loaded || loadedProject.saved) {
      return updateFlow();
    }

    const savedGraph = saveGraph(); // TODO stupid react re-rendering... project will still be stale and not have this graph

    const newProject = produce(project, (draft) => {
      draft.graphs[savedGraph.metadata!.id!] = savedGraph;
    });

    // Large datasets can save slowly because of indexeddb, so show a "saving..." toast if it's a slow save
    const flowDto: WorkflowCreateDto = {
      name: project.metadata.title,
      description: project.metadata.description,
      workspace_id: currentWorkspace?.workspace_id!,
      project: newProject
    };

    const toastId = toast.info('Saving project');
    try {
      const workflow = await createWorkflow(flowDto);

      toast.success('Flow saved');
      setLoadedProject({
        loaded: true,
        saved: true,
        id: newProject.metadata.id,
        path: '',
      });
      setFlow({
        ...flow,
        ...workflow
      });
    } catch (cause) {
      toast.error('Failed to save project');
    } finally {
      if (toastId) {
        toast.dismiss(toastId);
      }
    }
  }

  async function updateFlow() {
    const savedGraph = saveGraph(); // TODO stupid react re-rendering... project will still be stale and not have this graph

    const newProject = produce(project, (draft) => {
      draft.graphs[savedGraph.metadata!.id!] = savedGraph;
    });

    // Large datasets can save slowly because of indexeddb, so show a "saving..." toast if it's a slow save
    const saving = toast.info('Saving flow');
    try {
      const updated = await updateWorkflow(flow.id, flow);
      toast.success('Flow saved');
      setLoadedProject({
        loaded: true,
        saved: true,
        id: newProject.metadata.id,
        path: '',
      });
      setFlow({
        ...flow,
        ...updated
      });
    } catch (cause) {
      toast.error('Failed to save flow');
    } finally {
      if (saving) {
        toast.dismiss(saving);
      }
    }
  }

  return {
    saveFlow,
    updateFlow,
  };
}
