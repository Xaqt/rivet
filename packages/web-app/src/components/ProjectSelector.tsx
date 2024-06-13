import { css } from '@emotion/react';
import type React from 'react';
import { type FC, useState, Fragment } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import Spinner from '@atlaskit/spinner';
import LeftIcon from 'majesticons/line/chevron-left-line.svg?react';
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
import { useRunMenuCommand } from '../hooks/useMenuCommands';
import { EditProjectModalRenderer } from './EditProjectModal';
import { Asterisk } from '../assets/icons/asterisk';
import { SaveIcon } from '../assets/icons/save-icon';
import FileImportIcon from '../assets/icons/file-import-icon';
import { DeleteWorkflowModalRenderer } from '../pages/flows/DeleteWorkflowModal';
import Button from '@atlaskit/button';
import { useSaveFlow } from '../hooks/useSaveFlow';
import { getError } from '../utils/errors';
import { toast } from 'react-toastify';

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
        color: var(--grey-light);
        white-space: nowrap;
    }
    
    span.title-name {
        flex: 1;
        min-width: 260px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    button {
        cursor: pointer;
    }

    > .actions {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 5px;

        button {
            svg {
                width: 24px;
                height: 24px;
            }
        }

    }
`;

export const ProjectSelector: FC = () => {
  const project= useRecoilValue(projectState);
  const [title, setTitle] = useState(project?.metadata.title);
  const loadedState = useRecoilValue(loadedProjectState);
  const setEditProjectModalOpen = useSetRecoilState(editProjectModalOpenState);
  const [, setOpenOverlay] = useRecoilState(overlayOpenState);
  const [deleteProjectModalOpen, setDeleteProjectModalOpen] = useRecoilState(deleteFlowModalOpenState);
  const [saving, setSaving] = useState(false);
  const { saveFlow, updateFlow } = useSaveFlow();

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

  function handleSave() {
    setSaving(true);
    saveFlow()
      .catch((e) => {
        const msg = getError(e).message;
        toast.error(`Failed to save project: ${msg}`);
      })
      .finally(() => setSaving(false));
  }

  function handleDelete() {
    setDeleteProjectModalOpen(true);
  }

  const ProjectDropdownMenu = () => {
    return (
      <DropdownMenu<HTMLButtonElement>
        trigger={({ triggerRef, ...props }) => (
          <Button {...props} ref={triggerRef} appearance="subtle" isDisabled={saving}>
            <SettingsCogIcon width={24} height={24} />
          </Button>
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
          <Button onClick={handleEditFlow} appearance="subtle" isDisabled={saving}>
            <EditIcon label="edit" />
          </Button>
        </div>
        <div className="actions">
          <Button appearance="subtle">
            {saving ? <Spinner size="small" /> : <SaveIcon onClick={handleSave} />}
          </Button>
          <ProjectDropdownMenu />
        </div>
      </div>
      <EditProjectModalRenderer />
      <DeleteWorkflowModalRenderer onFlowDeleted={onFLowDeleted}/>
    </Fragment>
  );
};
