import { useWindowsHotkeysFix } from '../hooks/useWindowsHotkeysFix';
import { GraphBuilder } from './GraphBuilder.js';
import { type FC, Fragment, useEffect, useState } from 'react';
import { css } from '@emotion/react';
import { SettingsModal } from './SettingsModal.js';
import { setGlobalTheme } from '@atlaskit/tokens';
import { LeftSidebar } from './LeftSidebar.js';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useGraphExecutor } from '../hooks/useGraphExecutor.js';
import { useMenuCommands } from '../hooks/useMenuCommands.js';
import { ActionBar } from './ActionBar';
import { DebuggerPanelRenderer } from './DebuggerConnectPanel';
import { ChatViewerRenderer } from './ChatViewer';
import { useRecoilState, useRecoilValue } from 'recoil';
import { themeState } from '../state/settings';
import clsx from 'clsx';
import { useLoadStaticData } from '../hooks/useLoadStaticData';
import { StatusBar } from './StatusBar';
import { ProjectSelector } from './ProjectSelector';
import { NewProjectModalRenderer } from './NewProjectModal';
import WorkflowsTable from '../pages/flows/WorkflowsTable';
import { loginDialogOpenState, overlayOpenState } from '../state/ui';
import { useAuth } from '../hooks/useAuth';
import { useEnsureLoggedIn } from '../hooks/useEnsureLoggedIn';

const styles = css`
  overflow: hidden;
`;

setGlobalTheme({
  colorMode: 'dark',
});

export const RivetApp: FC = () => {
  const { tryRunGraph, tryRunTests, tryAbortGraph, tryPauseGraph, tryResumeGraph } = useGraphExecutor();
  const [openOverlay, setOpenOverlay] = useRecoilState(overlayOpenState);

  const theme = useRecoilValue(themeState);

  useLoadStaticData();

  useMenuCommands({
    onRunGraph: tryRunGraph,
  });

  useWindowsHotkeysFix();

  useEnsureLoggedIn();

  function FlowsTable() {
    console.log('FlowsTable');
    return (
      <div>
        <WorkflowsTable />
      </div>
    );
  }

  if (openOverlay === 'flowList') {
    return <FlowsTable />;
  }

  return (
    <div className={clsx('app', theme ? `theme-${theme}` : 'theme-default')} css={styles}>
      <ProjectSelector />
      <ActionBar
        onRunGraph={tryRunGraph}
        onRunTests={tryRunTests}
        onAbortGraph={tryAbortGraph}
        onPauseGraph={tryPauseGraph}
        onResumeGraph={tryResumeGraph}
      />
      <StatusBar />
      <DebuggerPanelRenderer />
      <LeftSidebar onRunGraph={(graphId) => tryRunGraph({ graphId })} />
      <GraphBuilder />
      <SettingsModal />
      <ChatViewerRenderer />
      <NewProjectModalRenderer />
      <ToastContainer enableMultiContainer position="bottom-right" hideProgressBar newestOnTop />
      <ToastContainer
        enableMultiContainer
        containerId="wide"
        style={{ width: 600 }}
        position="bottom-right"
        hideProgressBar
        newestOnTop
      />
    </div>
  );
};
