import axios, { type AxiosResponse } from 'axios';
import {
  type FindWorkflowsDto,
  type Label,
  type PagedWorkflowResponse,
  type UpdateWorkflowDto,
  type Workflow,
  type WorkflowCreateDto,
} from './types';

const getBaseUrl = () => {

  function assumeNext(): string | undefined {
    try {
      return process?.env?.NEXT_PUBLIC_BASE_URL;
    } catch {
      return undefined;
    }
  }

  function assumeVite(): string | undefined {
    try {
      return import.meta?.env?.API_BASE_URL;
    } catch {
      return undefined;
    }
  }

  // HACK: until it moves to the agent app
  const url = assumeNext() || assumeVite();
  console.log("base url", url);
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('api interceptor token', token);
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    alert(`api interceptor Error response ${error.response}`);

    return Promise.reject(error);
  }
);

let isTokenRefreshing = false;

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isTokenRefreshing
    ) {
      try {
        originalRequest._retry = true;
        isTokenRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');

        console.log('original request', originalRequest);

        await authApi.refreshToken(refreshToken!);
        isTokenRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh error', refreshError);
        window.location.href = '/login/sign-in';
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username: string, password: string) => {
    const loginData = {
      username,
      password,
    };
    try {
      const response = await api.post('/auth/login', loginData);
      localStorage.setItem('authToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      if (response.data && response.data.accessToken) {
        const accessToken = response.data.accessToken;
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error('Authorization error', error);
      throw error;
    }
  },
  refreshToken: async (refreshToken: string) => {
    try {
      const response = await api.post('/auth/refresh', {
        refreshToken,
        withCredentials: true,
      });

      if (response.data && response.data.accessToken) {
        const accessToken = response.data.accessToken;
        localStorage.setItem('authToken', response.data.accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      window.location.href = '/login/sign-in';
      console.error('Authorization error', error);
      throw error;
    }
  },
  getCurrentUser: async (tryAgain = false) => {
    tryAgain = !tryAgain;
    try {
      const response = await api.get('/users/me');
      console.log('original current user response: ', response.data);
      return response.data;
    } catch (error) {
      if (tryAgain) {
        console.log('trying again to get current user');
        await authApi.getCurrentUser(true);
      } else {
        window.location.href = '/login/sign-in';
      }
      console.error('Get current user error', error);
    }
  },
  getAuthToken(): string {
    return localStorage.getItem('authToken')!;
  }
};

export const labelApi = {
  getAllGroups: async (workspaceId: string, withLabels = false) => {
    try {
      const response = await api.get(`/${workspaceId}/labels/groups`, {
        params: { with_labels: withLabels },
      });
      return response.data;
    } catch (error) {
      console.error('Get all label group', error);
    }
  },
  getAllLabelsInGroup: async (workspaceId: string, groupId: string) => {
    try {
      const response = await api.get(
        `/${workspaceId}/labels/groups/${groupId}`
      );
      return response.data;
    } catch (error) {
      console.error('Get all labels in group', error);
    }
  },
  getAllLabels: async (workspaceId: string) => {
    try {
      const response = await api.get<Label[]>(`/${workspaceId}/labels`);
      return response.data || [];
    } catch (error) {
      console.error('Get all labels', error);
    }
  },
  createGroup: async (workspaceId: string, name: string) => {
    try {
      const response = await api.post(`/${workspaceId}/labels/groups`, {
        name,
      });
      return response.data;
    } catch (error) {
      console.error('Create group error ', error);
    }
  },
  createLabelAlone: async (
    workspaceId: string,
    name: string,
    color: string
  ) => {
    try {
      const response = await api.post(`/${workspaceId}/labels`, {
        name,
        color,
      });
      return response.data;
    } catch (error) {
      console.error('Create alone label error ', error);
    }
  },
  createLabelInGroup: async (
    workspaceId: string,
    groupId: string,
    name: string,
    color: string
  ) => {
    try {
      const response = await api.post(
        `/${workspaceId}/labels/groups/${groupId}`,
        { name, color }
      );
      return response.data;
    } catch (error) {
      console.error('Create label in group error ', error);
    }
  },
  deleteGroup: async (
    workspaceId: string,
    groupId: string,
    isDeleteLabels: boolean
  ) => {
    try {
      const response = await api.delete(
        `/${workspaceId}/labels/groups/${groupId}`,
        { data: { delete_labels: isDeleteLabels } }
      );
      return response.data;
    } catch (error) {
      console.error('Delete group error ', error);
    }
  },
  deleteLabel: async (workspaceId: string, labelId: string) => {
    try {
      const response = await api.delete(`/${workspaceId}/labels/${labelId}`);
      return response.data;
    } catch (error) {
      console.error('Delete label error ', error);
    }
  },
  updateLabel: async (
    workspaceId: string,
    labelId: string,
    groupId: string | null,
    name: string,
    color: string
  ) => {
    try {
      const response = await api.patch(`/${workspaceId}/labels/${labelId}`, {
        color,
        name,
        groupId,
      });
      return response.data;
    } catch (error) {
      console.error('Update label error', error);
    }
  },
  updateGroup: async (workspaceId: string, groupId: string, name: string) => {
    try {
      const response = await api.patch(
        `/${workspaceId}/labels/groups/${groupId}`,
        { name }
      );
      return response.data;
    } catch (error) {
      console.error('Update label error', error);
    }
  },
  moveLabelToAnotherGroup: async (
    workspaceId: string,
    labelId: string,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    new_group_id: string
  ) => {
    try {
      const response = await api.patch(
        `/${workspaceId}/labels/${labelId}/move`,
        { new_group_id }
      );
      return response.data;
    } catch (error) {
      console.error('move Label To Another Group error', error);
    }
  },
  addToConversation: async (
    workspaceId: string,
    conversationId: string,
    labelId: string
  ) => {
    try {
      const response = await api.patch(
        `/${workspaceId}/labels/conversation/${conversationId}`,
        { labels: [labelId] }
      );
      return response.data;
    } catch (error) {
      console.error('add label to conversation error', error);
    }
  },
  removeFromConversation: async (
    workspaceId: string,
    conversationId: string,
    labelId: string
  ) => {
    try {
      const response = await api.delete(
        `/${workspaceId}/labels/conversation/${conversationId}/remove`,
        { data: { labelId } }
      );
      return response.data;
    } catch (error) {
      console.error('add label to conversation error', error);
    }
  },
};

export const workflowApi = {
  find: async (workspaceId: string, criteria: FindWorkflowsDto): Promise<PagedWorkflowResponse> => {
    criteria = criteria || {
      page: 1,
      page_size: 10,
      order_by: 'created_at',
      order: 'DESC'
    };
    criteria.workspace_id ??= workspaceId;
    try {
      const response = await api.get<PagedWorkflowResponse>(`/workflows`, {
        params: criteria
      });
      return response.data;
    } catch (error) {
      console.error('Find all workflows error', error);
      throw error;
    }
  },
  getById: async (workflowId: string): Promise<Workflow> => {
    try {
      const response = await api.get<Workflow>(`/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('Get workflow by id error', error);
      throw error;
    }
  },
  create: async (workspaceId: string, body: WorkflowCreateDto): Promise<Workflow> => {
    try {
      const response = await api.post<Workflow>(`/${workspaceId}/workflows`, body);
      return response.data;
    } catch (error) {
      console.error('Create workflow error', error);
      throw error;
    }
  },
  delete: async (workflowId: string) => {
    try {
      const response = await api.delete(`/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('Delete workflow error', error);
      throw error;
    }
  },
  update: async (workflowId: string, body: UpdateWorkflowDto) => {
    try {
      const response = await api.patch<Workflow>(`/workflows/${workflowId}`, body);
      return response.data;
    } catch (error) {
      console.error('Update workflow error', error);
      throw error;
    }
  },
  addLabels: async (flowId: string, labelIds: string[]) => {
    try {
      const response = await api.post(`/workflows/${flowId}/labels`, labelIds);
      return response.data;
    } catch (error) {
      console.error('Add labels to workflow error', error);
      throw error;
    }
  },
  removeLabel: async (flowId: string, labelId: string) => {
    try {
      const response = await api.delete(`/workflows/${flowId}/labels/${labelId}`);
      return response.data;
    } catch (error) {
      console.error('Remove label from workflow error', error);
      throw error;
    }
  },
  saveRecording: async (workflowId: string, serializedRecording: string) => {
    try {
      const response = await api.post(`/workflows/${workflowId}/recording`, serializedRecording);
      return response.data;
    } catch (error) {
      console.error('Save recording error', error);
      throw error;
    }
  },
  getRecording: async (workflowId: string) => {
    try {
      const response = await api.get(`/workflows/${workflowId}/recording`);
      return response.data;
    } catch (error) {
      console.error('Get recording error', error);
      throw error;
    }
  },
  deleteRecording: async (workflowId: string, recordingId: string) => {
    try {
      const response = await api.delete(`/workflows/${workflowId}/recording/${recordingId}`);
      return response.data;
    } catch (error) {
      console.error('Delete recording error', error);
      throw error;
    }
  },
  getRun: async (workflowId: string, runId: string) => {
    try {
      const response = await api.get(`/workflows/${workflowId}/runs/${runId}`);
      return response.data;
    } catch (error) {
      console.error('Get run error', error);
      throw error;
    }
  },
  getRuns: async (workflowId: string) => {
    try {
      const response = await api.get(`/workflows/${workflowId}/runs`);
      return response.data;
    } catch (error) {
      console.error('Get runs error', error);
      throw error;
    }
  },
};
