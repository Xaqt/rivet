import axios, { type AxiosResponse } from 'axios';
import { type FindWorkflowsDto, type PagedWorkflowResponse, type UpdateWorkflowDto, type Workflow, type WorkflowCreateDto } from './types';

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
      const response = await api.get<PagedWorkflowResponse>(`/workspaces/${workspaceId}/reports`, {
        params: criteria
      });
      return response.data;
    } catch (error) {
      console.error('Find all workflows error', error);
      throw error;
    }
  },
  getById: async (workspaceId: string, workflowId: string): Promise<Workflow> => {
    try {
      const response = await api.get<Workflow>(`/${workspaceId}/workflows/${workflowId}`);
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
  delete: async (workspaceId: string, workflowId: string) => {
    try {
      const response = await api.delete(`/${workspaceId}/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('Delete workflow error', error);
      throw error;
    }
  },
  update: async (workspaceId: string, workflowId: string, body: UpdateWorkflowDto) => {
    try {
      const response = await api.patch<Workflow>(`/${workspaceId}/workflows/${workflowId}`, body);
      return response.data;
    } catch (error) {
      console.error('Update workflow error', error);
      throw error;
    }
  },
};
