import { loginDialogOpenState } from '../state/ui';
import { useAuth } from './useAuth';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

export const useEnsureLoggedIn = () => {
  const [, setLoginDialogOpen] = useRecoilState(loginDialogOpenState);
  const { currentUser } = useAuth();

  useEffect(() => {
    setLoginDialogOpen(!currentUser);
  }, [currentUser]);

  return {
    currentUser
  };
};
