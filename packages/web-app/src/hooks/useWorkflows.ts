import { getError } from '@ironclad/rivet-core';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRecoilState, useRecoilValue } from 'recoil';
import { workflowListState, workflowSearchCriteriaState } from '../state/workflows';
import { workflowApi } from '../api/api-client';
import { type FindWorkflowsDto, type Workflow, type WorkflowCreateDto } from '../api/types';
import { useStableCallback } from './useStableCallback';
import { useAuth } from './useAuth';
import { flowState } from '../state/savedGraphs';

export function useWorkflows() {

  const { currentWorkspace } = useAuth();
  const [currentWorkflow, setCurrentWorkflow] = useRecoilState(flowState)
  const [workflows, updateWorkflows] = useRecoilState(workflowListState);
  const [loading, setLoading] = useState(false);
  const [searchCriteria, setSearchCriteria] = useRecoilState(workflowSearchCriteriaState);

  const [pageIndex, setPageIndex] = useState(searchCriteria.page ?? 1);
  const [pageSize, setPageSize] = useState(searchCriteria.page_size || 20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [workspaceId, setWorkspaceId] = useState(currentWorkspace?.workspace_id || '');

  useEffect(() => {
    setWorkspaceId(currentWorkspace?.workspace_id || '');
  }, [currentWorkspace]);

  function execLoading<T>(fn: () => Promise<T>, reload = true) {
    setLoading(true);
    return fn()
      .then((res) => {
        if (reload) {
          reloadWorkflows();
        }
        return res;
      }).catch(e => {
        toast.error(getError(e).message);
      }).finally(() => {
        setLoading(false);
      });
  }

  const initWorkflows = useStableCallback(() => {
    if (searchCriteria.workspace_id !== workspaceId) {
      setSearchCriteria({
        ...searchCriteria,
        workspace_id: workspaceId,
        page: 1,
      });
    }
    setLoading(true);
    reloadWorkflows();
    setLoading(false);
  });

  const reloadWorkflows = () => fetchWorkflows(searchCriteria);

  const fetchWorkflows = (criteria?: Partial<FindWorkflowsDto>) => {
    const findCriteria = {
      ...searchCriteria,
      ...(criteria || {}),
    } as FindWorkflowsDto;

    workflowApi.find(workspaceId, findCriteria)
      .then((res) => {
        setTotalPages(res.total_pages);
        setTotalCount(res.total_count);
        updateWorkflows(res.flows);
        setSearchCriteria(findCriteria);
        return res;
      }).catch(err => {
        toast.error(getError(err).message);
      });
  };

  useEffect(initWorkflows, [workspaceId, initWorkflows]);

  useEffect(() => {
    setSearchCriteria({
      ...searchCriteria,
      workspace_id: workspaceId,
      page: pageIndex,
      page_size: pageSize,
    });
    // initWorkflows();
  }, [pageIndex, pageSize, workspaceId]);

  const getWorkflowById = async (id: string) => {
    return execLoading(() => workflowApi.getById(workspaceId, id), false);
  };

  const updateWorkflow = async (id: string, workflow: Partial<Workflow>) => {
    return execLoading(async () => {
      const res = await workflowApi.update(workspaceId, id, workflow);
      const index = workflows.findIndex((w) => w.id === id);
      if (index >= 0) {
        workflows[index] = res;
        updateWorkflows([...workflows]);
      }
      return res;
    });
  };

  const createWorkflow = async (workflow: WorkflowCreateDto) => {
    return execLoading(() => workflowApi.create(workspaceId, workflow));
  };

  const deleteWorkflow = async (workflowId: string) => {
    await execLoading(() => workflowApi.delete(workspaceId, workflowId));
  };

  const addWorkflowLabels = async (flowId: string, labelIds: string[]) => {
    return execLoading(() => workflowApi.addLabels(flowId, labelIds));
  };

  const removeWorkflowLabel = async (flowId: string, labelId: string) => {
    return execLoading(() => workflowApi.removeLabel(flowId, labelId));
  };

  return {
    workflows,
    addWorkflowLabels,
    removeWorkflowLabel,
    getWorkflowById,
    fetchWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    loading,
    pageSize,
    setPageSize,
    pageIndex,
    setPageIndex,
    totalPages,
    totalCount,
    searchCriteria,
    setSearchCriteria
  };
}
