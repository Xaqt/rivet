import { getError, type GraphId } from '@ironclad/rivet-core';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRecoilState, useRecoilValue } from 'recoil';
import { workflowListState } from '../state/workflows';
import { workflowApi } from '../api/api-client';
import { type WorkflowCreateDto, WorkflowImpl } from '../api/types';
import { workspaceState } from '../state/auth';
import { flowState, type OpenedProjectInfo } from '../state/savedGraphs';
import { useLoadFlow } from './useLoadFlow';

export function useWorkflows() {
  const loadFlow = useLoadFlow();
  const currentWorkspace = useRecoilValue(workspaceState);
  const [currentFlow, setCurrentFlow] = useRecoilState(flowState);
  const [workflows, updateWorkflows] = useRecoilState(workflowListState);
  const [loading, setLoading] = useState(false);
  const [workspaceId, setWorkspaceId] = useState(currentWorkspace?.workspace_id || '');

  useEffect(() => {
    setWorkspaceId(currentWorkspace?.workspace_id || '');
  }, [currentWorkspace]);

  function execLoading<T>(fn: () => Promise<T>) {
    setLoading(true);
    return fn().catch(e => {
      toast.error(getError(e).message);
    }).finally(() => {
      setLoading(false);
    });
  }

  const getWorkflowById = async (id: string) => {
    return execLoading(() => workflowApi.getById(id));
  };

  const updateWorkflow = async <Workflow>(id: string, workflow: Partial<Workflow>) => {
    setLoading(true);
    try {
      const res = await workflowApi.update(id, workflow);
      const index = workflows.findIndex((w) => w.id === id);
      if (index >= 0) {
        workflows[index] = res;
        updateWorkflows([...workflows]);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async (workflow: WorkflowCreateDto) => {
    setLoading(true);
    try {
      return await workflowApi.create(workspaceId, workflow);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    await execLoading(() => workflowApi.delete(workflowId));
  };

  const addWorkflowLabels = async (flowId: string, labelIds: string[]) => {
    return execLoading(() => workflowApi.addLabels(flowId, labelIds));
  };

  const removeWorkflowLabel = async (flowId: string, labelId: string) => {
    return execLoading(() => workflowApi.removeLabel(flowId, labelId));
  };

  function duplicateFlow(source?: WorkflowImpl, mainGraphId?: GraphId) {
    const flow = WorkflowImpl.copy(source ?? currentFlow);
    const project = flow.project;
    const projectInfo: OpenedProjectInfo = {
      workflow: flow,
      openedGraph: mainGraphId ?? project.metadata?.mainGraphId,
    };
    loadFlow(projectInfo).catch(console.error);
  }

  return {
    addWorkflowLabels,
    removeWorkflowLabel,
    getWorkflowById,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    loading,
    duplicateFlow,
  };
}
