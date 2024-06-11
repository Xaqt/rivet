import { atom } from 'recoil';
import { type User, type Workspace } from '../api/types';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist({ key: 'auth' });

export const userState = atom<User | undefined>({
  key: 'current-user',
  default: undefined,
  effects: [persistAtom],
});

export const workspaceState = atom<Workspace | undefined>({
  key: 'current-workspace',
  default: undefined,
  effects: [persistAtom],
});
