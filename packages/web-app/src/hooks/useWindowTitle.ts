import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { projectState, loadedProjectState } from '../state/savedGraphs';

export function useWindowTitle() {
  const [project, setProject] = useRecoilState(projectState);
  const loadedProject = useRecoilValue(loadedProjectState);
  const [title, setTitle] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const status = loadedProject?.saved ? '' : ' (unsaved)';
        const _title = `${project.metadata.title}${status}`;
        setTitle(_title);
      } catch (err) {
        console.warn(`Failed to set window title, likely not running in Tauri: ${err}`);
      }
    })();
  }, [loadedProject, project.metadata.title]);

  useEffect(() => {
    if (project?.metadata) {
      // todo: set window title
      // project.metadata.title = title;
    }
  }, [title]);

  return {
    title,
    setTitle,
  };
}
