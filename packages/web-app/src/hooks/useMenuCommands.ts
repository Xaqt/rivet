import { useEffect } from 'react';
import { useSaveProject } from './useSaveProject.js';
import { match } from 'ts-pattern';
import { useLoadProjectWithFileBrowser } from './useLoadProjectWithFileBrowser.js';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { settingsModalOpenState } from '../components/SettingsModal.js';
import { graphState } from '../state/graph.js';
import { useLoadRecording } from './useLoadRecording.js';
import { helpModalOpenState, newProjectModalOpenState } from '../state/ui';
import { useToggleRemoteDebugger } from '../components/DebuggerConnectPanel';
import { lastRunDataByNodeState } from '../state/dataFlow';
import { useImportGraph } from './useImportGraph';
import { toast } from 'react-toastify';

export type MenuIds =
  | 'settings'
  | 'new_project'
  | 'open_project'
  | 'save_project'
  | 'duplicate_project'
  | 'save_project_as'
  | 'export_graph'
  | 'import_graph'
  | 'run'
  | 'load_recording'
  | 'remote_debugger'
  | 'toggle_devtools'
  | 'clear_outputs'
  | 'get_help';

const handlerState: {
  handler: (e: { payload: MenuIds }) => void;
} = { handler: () => {} };

export function useRunMenuCommand() {
  return (command: MenuIds) => {
    const { handler } = handlerState;

    handler({ payload: command });
  };
}

export function useMenuCommands(
  options: {
    onRunGraph?: () => void;
  } = {},
) {
  const [graphData, setGraphData] = useRecoilState(graphState);
  const { saveProject, saveProjectAs } = useSaveProject();
  const setNewProjectModalOpen = useSetRecoilState(newProjectModalOpenState);
  const loadProject = useLoadProjectWithFileBrowser();
  const setSettingsOpen = useSetRecoilState(settingsModalOpenState);
  const { loadRecording } = useLoadRecording();
  const toggleRemoteDebugger = useToggleRemoteDebugger();
  const setLastRunData = useSetRecoilState(lastRunDataByNodeState);
  const importGraph = useImportGraph();
  const setHelpModalOpen = useSetRecoilState(helpModalOpenState);

  useEffect(() => {
    const handler: (e: { payload: MenuIds }) => void = ({ payload }) => {
      match(payload as MenuIds)
        .with('settings', () => {
          setSettingsOpen(true);
        })
        .with('new_project', () => {
          setNewProjectModalOpen(true);
        })
        .with('open_project', () => {
          loadProject();
        })
        .with('save_project', () => {
          saveProject();
        })
        .with('duplicate_project', () => {
          toast.error('Not implemented yet');
        })
        .with('save_project_as', () => {
          saveProjectAs();
        })
        .with('export_graph', () => {
          // importGraph();
          console.log('export_graph');
        })
        .with('import_graph', () => {
          importGraph();
        })
        .with('run', () => {
          options.onRunGraph?.();
        })
        .with('load_recording', () => {
          loadRecording();
        })
        .with('remote_debugger', () => {
          toggleRemoteDebugger();
        })
        .with('toggle_devtools', () => {})
        .with('clear_outputs', () => {
          setLastRunData({});
        })
        .with('get_help', () => {
          setHelpModalOpen(true);
        })
        .exhaustive();
    };

    const prevHandler = handlerState.handler;
    handlerState.handler = handler;

    return () => {
      handlerState.handler = prevHandler;
    };
  }, [
    saveProject,
    saveProjectAs,
    loadProject,
    setSettingsOpen,
    graphData,
    setGraphData,
    options,
    loadRecording,
    importGraph,
    toggleRemoteDebugger,
    setLastRunData,
    setNewProjectModalOpen,
  ]);
}
