import { useRecoilState, useSetRecoilState } from 'recoil';
import { loadedProjectState, projectState } from '../state/savedGraphs.js';
import { deserializeProject, getError } from '@ironclad/rivet-core';
import { trivetState } from '../state/trivet.js';
import { toast } from 'react-toastify';
import { graphNavigationStackState } from '../state/graphBuilder';
import { type FileUpload, useFileUpload } from 'use-file-upload';
import { deserializeTrivetData, type SerializedTrivetData } from '@ironclad/trivet';
import { WorkflowImpl } from '../api/types';
import { useLoadFlow } from './useLoadFlow';
import { overlayOpenState } from '../state/ui';

export function useLoadProjectWithFileBrowser() {
  const [currentProject, setProject] = useRecoilState(projectState);
  const setLoadedProjectState = useSetRecoilState(loadedProjectState);
  const setTrivetState = useSetRecoilState(trivetState);
  const setNavigationStack = useSetRecoilState(graphNavigationStackState);
  const [, setOpenOverlay] = useRecoilState(overlayOpenState);
  const loadFlow = useLoadFlow();
  const [, selectFile] = useFileUpload();

  async function onOpen(file: File) {
    const text = await file.text();
    try {
      const [project, attachedData] = deserializeProject(text);

      const testData = attachedData?.trivet
        ? deserializeTrivetData(attachedData.trivet as SerializedTrivetData)
        : { testSuites: [] };

        const alreadyOpenedProject = currentProject.metadata.id === project.metadata.id;

        if (alreadyOpenedProject) {
          toast.error(`That project is already open.`);
          return;
        }

        const flow = new WorkflowImpl();
        flow.id = project.metadata.id;
        flow.name = project.metadata.title;
        flow.description = project.metadata.description;
        flow.project = project;

        setNavigationStack({ stack: [], index: undefined });

        await loadFlow({ workflow: flow });

        setLoadedProjectState({
          loaded: true,
          saved: true,
        });

        setTrivetState({
          testSuites: testData.testSuites,
          selectedTestSuiteId: undefined,
          editingTestCaseId: undefined,
          recentTestResults: undefined,
          runningTests: false,
        });

      setOpenOverlay(undefined);
    } catch (err) {
      toast.error(`Failed to load project: ${getError(err).message}`);
    }
  }

  return () => {
    // Single File Upload accepts only images
    selectFile({ 
      accept: 'application/x-yaml, text/yaml',
      multiple: false,
    }, (upload: FileUpload | FileUpload[]) => {
      const item = Array.isArray(upload) ? upload[0] : upload;
      if (!item) {
        return;
      }
      onOpen(item.file).catch(console.log);
    });
  };
}
