import { useRecoilValue } from 'recoil';
import { lastRecordingState } from '../state/execution';
import { ioProvider } from '../utils/globals';
import { useCallback } from 'react';
import { projectState } from '../state/savedGraphs';
import { workflowApi } from '../api/api-client';

export function useSaveRecording() {
  const recording = useRecoilValue(lastRecordingState);
  const project = useRecoilValue(projectState);

  return useCallback(async () => {
    if (!recording) {
      return;
    }

    try {
      const id = project.metadata.id;
      await workflowApi.saveRecording(id, recording);
    } catch (err) {
      console.error(err);
    }
  }, [recording]);
}
