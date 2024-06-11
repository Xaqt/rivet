import { useState } from 'react';
import { type User, type Workspace } from '../api/types';
import { authApi } from '../api/api-client';
import { useRecoilState } from 'recoil';
import { userState, workspaceState } from '../state/auth';

interface AuthContext {
  loading: boolean;
  currentUser: User | undefined;
  fetchCurrentUser: () => Promise<User | undefined>;
  currentWorkspace: Workspace | undefined;
  setCurrentWorkspace: (workspace: Workspace) => void;
}

export const useAuth = (): AuthContext => {
  const [currentUser, setCurrentUser] = useRecoilState(userState);
  const [loading, setLoading] = useState(false);
  const [currentWorkspace, setWorkspace] = useRecoilState(workspaceState);

  const setCurrentWorkspace = (workspace: Workspace | undefined) => {
    setWorkspace(workspace);
  };

  const fetchCurrentUser = async (): Promise<User | undefined> => {
    setLoading(true);
    try {
      const user: User | undefined = await authApi.getCurrentUser();
      setCurrentUser(user);
      const memberships = user?.workspace_memberships ?? [];
      const currWs = memberships?.[0]?.workspace_id;
      setCurrentWorkspace(currWs);
      return user;
    } catch (error) {
      console.error(error);
      setCurrentUser(undefined);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentUser,
    loading,
    fetchCurrentUser,
    currentWorkspace,
    setCurrentWorkspace,
  };
};
