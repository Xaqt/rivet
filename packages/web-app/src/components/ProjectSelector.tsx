import { css } from '@emotion/react';
import type React from 'react';
import { type FC, useState, Fragment } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import LeftIcon from 'majesticons/line/chevron-left-line.svg?react';
import BlankFileIcon from 'majesticons/line/file-line.svg?react';
import SettingsCogIcon from 'majesticons/line/settings-cog-line.svg?react';
import ExportIcon from '@atlaskit/icon/glyph/export';
import CopyIcon from '@atlaskit/icon/glyph/copy';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import PlusIcon from '@atlaskit/icon/glyph/add';
import EditIcon from '@atlaskit/icon/glyph/edit';

import {
  projectState,
  loadedProjectState,
  flowState,
} from '../state/savedGraphs';
import { useLoadProjectWithFileBrowser } from '../hooks/useLoadProjectWithFileBrowser';
import {
  deleteFlowModalOpenState,
  editProjectModalOpenState,
  newProjectModalOpenState,
  overlayOpenState,
} from '../state/ui';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import { useStableCallback } from '../hooks/useStableCallback';
import { type MenuIds, useRunMenuCommand } from '../hooks/useMenuCommands';
import { EditProjectModalRenderer } from './EditProjectModal';
import { Asterisk } from '../assets/icons/asterisk';
import { SaveIcon } from '../assets/icons/save-icon';
import FileImportIcon from '../assets/icons/file-import-icon';
import { DeleteWorkflowModalRenderer } from '../pages/flows/DeleteWorkflowModal';

export const styles = css`
    position: absolute;

    left: 0;
    top: 0;
    right: 0;
    height: var(--project-selector-height);
    z-index: 101;

    background: var(--grey-darkerish);
    border-bottom: 1px solid var(--grey);

    display: flex;
    justify-content: space-between;
    align-items: center;

    .projects-container {
        display: flex;
        flex: 1;
        width: 100%;
        overflow: hidden;
    }

    .projects {
        display: flex;
        align-items: stretch;
        height: 100%;
        gap: 1px;
        padding-right: 1px;
        width: 100%;
    }
    
    .project-inputs {
        margin-right: auto;
        gap: 5px;
        display: flex;
        align-items: center;
        padding-right: 10px;
        min-width: 320px;
    }
    
    .title-name {
        padding-left: 10px;
        font-size: 16px;
        color: var(--grey-light);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    span.title-name {
        flex: 1;
        min-width: 220px;
    }
    
    button {
        cursor: pointer;
    }

    > .actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-right: 8px;

        button {
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            margin: 0;
            border-radius: 5px;
            background: transparent;
            padding: 8px;
            width: 32px;
            height: 32px;
            justify-content: center;

            svg {
                width: 16px;
                height: 16px;
            }
        }

    }

    .draggableProject {
        display: flex;
        min-width: 50px;
        flex-shrink: 1;
    }

    .project {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 6px 0 12px;
        cursor: pointer;
        user-select: none;
        gap: 8px;
        font-size: 12px;
        height: calc(100% + 1px);
        margin-bottom: -1px;
        background: var(--grey-darkerish);
        border-bottom: 1px solid var(--grey);
        flex-shrink: 1;
        min-width: 50px;
        position: relative;

        svg {
            width: 12px;
            height: 12px;
        }

        .project-name {
            display: flex;
            align-items: center;
            align-self: stretch;
            overflow: hidden;
            gap: 8px;
            min-width: 50px;
            flex-shrink: 1;
            white-space: nowrap;
            text-overflow: ellipsis;

            > span {
                min-width: 50px;
                flex-shrink: 1;
            }
        }

        &:hover {
            background-color: var(--grey-darkish);
            border-bottom: 1px solid var(--grey);
        }

        &.active {
            background-color: var(--grey-darkish);
            border-bottom: 1px solid var(--primary);
        }

        &.unsaved {
            font-style: italic;
        }

        > .actions {
            display: flex;
            align-items: center;
            gap: 8px;
            visibility: hidden;
        }

        &:hover .actions {
            visibility: visible;
        }
    }

    .project::after {
        content: '';
        display: block;
        position: absolute;
        right: -1px;
        width: 1px;
        background-color: var(--grey-darkest);
        height: 100%;
    }
`;

export const ProjectSelector: FC = () => {
  const [flow, setFlow] = useRecoilState(flowState);
  const [project, setProject] = useRecoilState(projectState);
  const [title, setTitle] = useState(project?.metadata.title);
  const loadedState = useRecoilValue(loadedProjectState);
  const setEditProjectModalOpen = useSetRecoilState(editProjectModalOpenState);
  const [, setOpenOverlay] = useRecoilState(overlayOpenState);
  const [deleteProjectModalOpen, setDeleteProjectModalOpen] = useRecoilState(deleteFlowModalOpenState);

  const runMenuCommandImpl = useRunMenuCommand();

  const [fileMenuOpen, setFileMenuOpen] = useState(false);

  const runMenuCommand: typeof runMenuCommandImpl = (command) => {
    setFileMenuOpen(false);
    runMenuCommandImpl(command);
  };

  const setNewProjectModalOpen = useSetRecoilState(newProjectModalOpenState);
  const loadProjectWithFileBrowser = useLoadProjectWithFileBrowser();

  function gotoList() {
    setOpenOverlay('flowList');
  }

  function handleDuplicate() {
    runMenuCommand('duplicate_flow');
  }

  const openNewProjectModal = useStableCallback(() => setNewProjectModalOpen(true));

  function handleNewFlow(e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) {
    e.stopPropagation();
    openNewProjectModal();
  }

  function handleEditFlow(e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) {
    e.stopPropagation();
    setEditProjectModalOpen(true);
  }

  function onFLowDeleted() {
    setDeleteProjectModalOpen(false);
    gotoList();
  }

  function handleDelete() {
    setDeleteProjectModalOpen(true);
  }

  const ProjectDropdownMenu = () => {
    function getHandler(cmd: MenuIds) {
      const handler = (e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) => {
        runMenuCommand(cmd);
        e.preventDefault();
      };
      return handler;
    }

    return (
      <DropdownMenu<HTMLButtonElement>
        trigger={({ triggerRef, ...props }) => (
          <button {...props} ref={triggerRef}>
            <SettingsCogIcon />
          </button>
        )}
        shouldFlip={true}
        shouldRenderToParent>
        <DropdownItemGroup>
          <DropdownItem elemBefore={<PlusIcon label="new"/>} onClick={handleNewFlow}>New Flow</DropdownItem>
          <DropdownItem elemBefore={<CopyIcon label="duplicate"/>} onClick={handleDuplicate}>Duplicate</DropdownItem>
          <DropdownItem elemBefore={<FileImportIcon width={24} height={24}/>}>Import</DropdownItem>
          <DropdownItem elemBefore={<ExportIcon label="export"/>}>Export</DropdownItem>
          <DropdownItem elemBefore={<TrashIcon label="delete" />} onClick={handleDelete}>Delete</DropdownItem>
        </DropdownItemGroup>
      </DropdownMenu>
    );
  };

  return (
    <Fragment>
      <div css={styles}>
        <button onClick={gotoList}>
          <LeftIcon />
        </button>
        <div className="project-inputs">
          {!loadedState.saved && <Asterisk />}
          <span className="title-name">{title}</span>
          <button onClick={handleEditFlow}>
            <EditIcon label="edit" />
          </button>
        </div>
        <div className="projects-container">
          <div className="projects">
          </div>
          <SaveIcon onClick={() => runMenuCommand('save_flow')} />
          <ProjectDropdownMenu />
        </div>
      </div>
      <EditProjectModalRenderer />
      <DeleteWorkflowModalRenderer onFlowDeleted={onFLowDeleted}/>
    </Fragment>
  );
};
