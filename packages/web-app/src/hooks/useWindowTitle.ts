import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { projectState, loadedProjectState } from '../state/savedGraphs';

export function useWindowTitle() {
  const project = useRecoilValue(projectState);
  const loadedProject = useRecoilValue(loadedProjectState);
  const [title, setTitle] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const _title = `Rivet - ${project.metadata.title} (${
            loadedProject?.path?.trim() ? loadedProject.path : 'Unsaved'
          })`;
        setTitle(_title)
      } catch (err) {
        console.warn(`Failed to set window title, likely not running in Tauri: ${err}`);
      }
    })();
  }, [loadedProject, project.metadata.title]);

  return {
    title
  };
}
