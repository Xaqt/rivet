import Portal from '@atlaskit/portal';
import { css } from '@emotion/react';
import { type FC, useRef } from 'react';
import { useSetRecoilState } from 'recoil';
import { useLoadRecording } from '../hooks/useLoadRecording';
import { debuggerPanelOpenState } from '../state/ui';
import LinkIcon from 'majesticons/line/link-circle-line.svg?react';
import ForwardCircleIcon from 'majesticons/line/forward-circle-line.svg?react';

const moreMenuStyles = css`
  background-color: var(--grey-darkish);
  border-radius: 4px;
  border: 1px solid var(--grey-dark);
  box-shadow: 3px 1px 10px rgba(0, 0, 0, 0.5);
  min-width: 250px;
  display: flex;
  flex-direction: column;

  * {
    font-family: 'Roboto', sans-serif;
  }

  .menu-item-button {
    padding: 0.5rem 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    height: 48px;
    border-radius: 5px;
    background-color: transparent;
    border: none;
    font-size: 14px;
    color: var(--grey-lighter);

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

export const ActionBarMoreMenu: FC<{
  onClose: () => void;
  onCopyAsTestCase: () => void;
}> = ({ onClose, onCopyAsTestCase }) => {
  const dropdownTarget = useRef<HTMLDivElement>(null);
  const setDebuggerPanelOpen = useSetRecoilState(debuggerPanelOpenState);
  const { loadRecording } = useLoadRecording();

  const openDebuggerPanel = () => {
    setDebuggerPanelOpen(true);
    onClose();
  };

  const doLoadRecording = () => {
    loadRecording();
    onClose();
  };

  return (
    <div css={moreMenuStyles}>
      <Portal zIndex={1000}>
        <div ref={dropdownTarget} />
      </Portal>
      <div className="menu-item menu-item-button remote-debugger" onClick={openDebuggerPanel}>
        <LinkIcon /> Remote Debugger
      </div>
      <div className="menu-item menu-item-button load-recording" onClick={doLoadRecording}>
        <ForwardCircleIcon /> Load Recording
      </div>
    </div>
  );
};
