import { useEffect } from 'react';
import { useSaveFlow } from './useSaveFlow.js';
import { match } from 'ts-pattern';
import { useLoadProjectWithFileBrowser } from './useLoadProjectWithFileBrowser.js';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { settingsModalOpenState } from '../components/SettingsModal.js';
import { graphState } from '../state/graph.js';
import { useLoadRecording } from './useLoadRecording.js';
import { newProjectModalOpenState } from '../state/ui';
import { useToggleRemoteDebugger } from '../components/DebuggerConnectPanel';
import { lastRunDataByNodeState } from '../state/dataFlow';
import { useImportGraph } from './useImportGraph';
import { toast } from 'react-toastify';
import { getError } from '../utils/errors';
import { useWorkflows } from './useWorkflows';

export type MenuIds =
  | 'settings'
  | 'new_graph'
  | 'open_flow'
  | 'save_flow'
  | 'duplicate_flow'
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
  const { saveFlow } = useSaveFlow();
  const setNewProjectModalOpen = useSetRecoilState(newProjectModalOpenState);
  const loadProject = useLoadProjectWithFileBrowser();
  const setSettingsOpen = useSetRecoilState(settingsModalOpenState);
  const { loadRecording } = useLoadRecording();
  const toggleRemoteDebugger = useToggleRemoteDebugger();
  const setLastRunData = useSetRecoilState(lastRunDataByNodeState);
  const importGraph = useImportGraph();
  const { duplicateFlow } = useWorkflows();

  function handleDuplicate() {
    duplicateFlow();
  }

  useEffect(() => {
    const handler: (e: { payload: MenuIds }) => void = ({ payload }) => {
      match(payload as MenuIds)
        .with('settings', () => {
          setSettingsOpen(true);
        })
        .with('new_graph', () => {
          setNewProjectModalOpen(true);
        })
        .with('open_flow', () => {
          loadProject();
        })
        .with('save_flow', () => {
          saveFlow().catch((e) => {
            const msg = getError(e).message;
            toast.error(`Failed to save project: ${msg}`);
          });
        })
        .with('duplicate_flow', () => handleDuplicate())
        .with('export_graph', () => {
          // importGraph();
          console.log('export_graph');
        })
        .with('import_graph', () => importGraph())
        .with('run', () => {
          options.onRunGraph?.();
        })
        .with('load_recording', () => loadRecording())
        .with('remote_debugger', () => {
          toggleRemoteDebugger();
        })
        .with('toggle_devtools', () => {})
        .with('clear_outputs', () => {
          setLastRunData({});
        })
        .with('get_help', () => {
          // setHelpModalOpen(true);
        })
        .exhaustive();
    };

    const prevHandler = handlerState.handler;
    handlerState.handler = handler;

    return () => {
      handlerState.handler = prevHandler;
    };
  }, [
    saveFlow,
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
