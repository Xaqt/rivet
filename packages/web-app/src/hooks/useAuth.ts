import { useState } from 'react';
import { type User, type Workspace } from '../api/types';
import { authApi } from '../api/api-client';

interface AuthContext {
  loading: boolean;
  currentUser: User | null;
  fetchCurrentUser: () => Promise<void>;
  currentWorkspace: Workspace | undefined;
  setCurrentWorkspace: (workspace: Workspace) => void;
}

export const useAuth = (): AuthContext => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentWorkspace, setWorkspace] = useState<
    Workspace | undefined
  >();

  const setCurrentWorkspace = (workspace: Workspace) => {
    setWorkspace(workspace);
    // Store the currentWorkspace in localStorage
    if (!currentUser) return;
    localStorage.setItem(
      `ws-key-${currentUser!.user_id}`,
      JSON.stringify(workspace)
    );
  };

  const fetchCurrentUser = async () => {
    setLoading(true);
    try {
      const user: User = await authApi.getCurrentUser();

      if (localStorage.getItem(`ws-key-${user.user_id}`)) {
        const currWs = localStorage.getItem(`ws-key-${user.user_id}`);
        setCurrentWorkspace(currWs ? JSON.parse(currWs) : undefined);
      } else {
        const memberships = user?.workspace_memberships ?? [];
        const currWs = memberships?.[0]?.workspace_id;
        setWorkspace(currWs);
        localStorage.setItem(`ws-key-${user.user_id}`, JSON.stringify(currWs));
      }
      setCurrentUser(user);
    } catch (error) {
      console.error(error);
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
