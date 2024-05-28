import { useQuery } from '@tanstack/react-query';

export function useCurrentVersion() {
    const { data } = useQuery('currentVersion', () => fetchCurrentVersion());
    return data;
}
