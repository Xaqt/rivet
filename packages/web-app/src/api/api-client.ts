import axios, { type AxiosResponse } from 'axios';
import {
  type FindWorkflowsDto,
  type Label,
  type PagedWorkflowResponse,
  type UpdateWorkflowDto,
  type User,
  type Workflow,
  type WorkflowCreateDto,
} from './types';
import { getEnvVar } from '../utils/tauri';

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
      return import.meta?.env?.VITE_API_BASE_URL;
    } catch {
      return undefined;
    }
  }

  try {
    if (process) {
      console.log("process.env", process.env);
    }
  } catch {}

  console.log("import.meta.env", import.meta.env);
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

function getAxiosError(response: any) {
  if (response?.data?.error) {
    return response.data.message;
  }
  return response.statusText;
}

function processResponse<T = any>(response: AxiosResponse): T {
  if (response.status >= 200 && response.status < 300) {
    return response.data as T;
  }
  throw new Error(getAxiosError(response));
}

let isTokenRefreshing = false;

function gotoLogin() {
  // const [_, setOpen] = useRecoilState(loginDialogOpenState);
  // setOpen(true);
  window.location.href = '/login/sign-in';
}

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error?.code === 'ERR_NETWORK') {
      console.log('Network error');
      return Promise.reject(error);
    }

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isTokenRefreshing
    ) {
      isTokenRefreshing = true;
      try {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken || refreshToken === 'undefined') {
          isTokenRefreshing = false;
          console.log('no refresh token. Going to login');
          await authApi.login(undefined, undefined, false);
          return;
        }

        console.log('original request', originalRequest);

        await authApi.refreshToken(refreshToken!);
        isTokenRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh error', refreshError);
        gotoLogin();
      } finally {
        isTokenRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const DEFAULT_USERNAME = 'collie.clayton@gmail.com';
const DEFAULT_PASSWORD = 'ChangePass123!';

export const authApi = {
  login: async (username?: string, password?: string, intercept = true) => {
    // TESTING: REMOVE
    username = username?.length ? username : getEnvVar('VITE_USERNAME') ?? DEFAULT_USERNAME;
    password = password?.length ? password : getEnvVar('VITE_PASSWORD') ?? DEFAULT_PASSWORD;

    const loginData = {
      username,
      password,
    };
    try {
      const response = await api.post('/auth/login', loginData,
        !intercept ? { validateStatus: null } : undefined).then(processResponse);
      const { accessToken, refreshToken } = response;
      console.log('login response', response);

      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      if (accessToken) {
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error('Authorization error', error);
      throw error;
    }
  },
  isLoggedIn: () => {
    const token = localStorage.getItem('authToken');
    return token?.length && token !== 'undefined';
  },
  refreshToken: async (refreshToken: string) => {
    try {
      const response = await api.post('/auth/refresh', {
        refreshToken,
        withCredentials: true,
      }).then(processResponse);
      const accessToken = response.accessToken;
      if (accessToken) {
        localStorage.setItem('authToken', accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      window.location.href = '/login/sign-in';
      console.error('Authorization error', error);
      throw error;
    }
  },
  getCurrentUser: async (tryAgain = false): Promise<User | undefined> => {
    try {
      const response = await api.get('/users/me').then(processResponse);
      console.log('original current user response: ', response);
      return response;
    } catch (error) {
      console.error('Get current user error', error);
      if (tryAgain) {
        console.log('trying again to get current user');
        return authApi.getCurrentUser(false);
      } else {
        gotoLogin();
        return undefined;
      }
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
    return api.get<PagedWorkflowResponse>(`/workflows`, {
      params: criteria
    }).then(processResponse<PagedWorkflowResponse>);
  },
  getById: async (workflowId: string): Promise<Workflow> => {
      return api.get<Workflow>(`/workflows/${workflowId}`)
        .then(processResponse<Workflow>);
  },
  create: async (workspaceId: string, body: WorkflowCreateDto): Promise<Workflow> => {
      return await api.post<Workflow>(`/${workspaceId}/workflows`, body)
        .then(processResponse<Workflow>);
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
     return api.patch<Workflow>(`/workflows/${workflowId}`, body)
        .then(processResponse<Workflow>);
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
