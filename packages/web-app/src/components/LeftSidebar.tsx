import { css } from '@emotion/react';
import { type FC } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { projectState } from '../state/savedGraphs.js';
import ExpandLeftIcon from 'majesticons/line/menu-expand-left-line.svg?react';
import ExpandRightIcon from 'majesticons/line/menu-expand-right-line.svg?react';
import { type GraphId } from '@ironclad/rivet-core';
import { sidebarOpenState } from '../state/graphBuilder.js';
import { GraphList } from './GraphList.js';
import { Text } from '@atlaskit/primitives';

const styles = css`
  position: fixed;
  top: var(--project-selector-height);
  left: 0;
  bottom: 0;
  width: 250px; // Adjust the width of the sidebar as needed
  background-color: var(--grey-dark-seethrougher);
  backdrop-filter: blur(2px);
  padding: 0;
  z-index: 50;
  border-right: 1px solid var(--grey);
  height: 100vh;

  .panel-header {
    padding-left: 7px;   
  }
    
  .panel {
    display: flex;
    flex-direction: column;
    width: 250px;
    margin: 0 -8px;
  }

  label {
    font-size: 12px;
  }
    
  .toggle-tab {
    position: absolute;
    top: 0;
    right: -32px;
    background-color: var(--grey-dark);
    border: 1px solid var(--grey);
    border-top: 0;
    border-left: 0;
    border-radius: 0 8px 8px 0;
    width: 32px;
    height: 32px;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 100;
  }

  .tabs,
  .tabs > div {
    height: 100%;
  }
`;

export const LeftSidebar: FC<{
  onRunGraph?: (graphId: GraphId) => void;
}> = ({ onRunGraph }) => {
  const project = useRecoilValue(projectState);
  const [sidebarOpen, setSidebarOpen] = useRecoilState(sidebarOpenState);

  return (
    <div
      css={styles}
      style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease' }}
      key={project.metadata.id}
    >
      <div className="toggle-tab" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <ExpandLeftIcon /> : <ExpandRightIcon />}
      </div>
      <div className="panel-header">
        <Text size={"large"}>Graphs</Text>
      </div>
      <div className="tabs">
        <div className="panel" data-contextmenutype="graph-list">
          <GraphList onRunGraph={onRunGraph} />
        </div>
      </div>
    </div>
  );
};
