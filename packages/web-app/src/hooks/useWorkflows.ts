import { getError, type GraphId } from '@ironclad/rivet-core';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRecoilState, useRecoilValue } from 'recoil';
import { workflowApi } from '../api/api-client';
import { type WorkflowCreateDto, WorkflowImpl } from '../api/types';
import { workspaceState } from '../state/auth';
import { flowState, type OpenedProjectInfo } from '../state/savedGraphs';
import { useLoadFlow } from './useLoadFlow';

export function useWorkflows() {
  const loadFlow = useLoadFlow();
  const currentWorkspace = useRecoilValue(workspaceState);
  const [currentFlow, setCurrentFlow] = useRecoilState(flowState);
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
      return workflowApi.update(id, workflow);
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async (workflow: WorkflowCreateDto) => {
    setLoading(true);
    try {
      workflow.workspace_id = workspaceId;
      return await workflowApi.create(workflow);
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
