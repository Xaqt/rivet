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
  newProjectModalOpenState,
  overlayOpenState,
} from '../state/ui';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import { useStableCallback } from '../hooks/useStableCallback';
import { useRunMenuCommand } from '../hooks/useMenuCommands';
import { EditFlowModal } from './EditProjectModal';
import { Asterisk } from '../assets/icons/asterisk';
import { SaveIcon } from '../assets/icons/save-icon';
import FileImportIcon from '../assets/icons/file-import-icon';
import DeleteWorkflowModal from '../pages/flows/DeleteWorkflowModal';
import Button from '@atlaskit/button';
import { useSaveFlow } from '../hooks/useSaveFlow';
import { getError } from '../utils/errors';
import { toast } from 'react-toastify';
import { type Workflow } from '../api/types';
import { useExportFlow } from '../hooks/useExportFlow';

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
        font-weight: bold;
        font-size: 18px;
        min-width: 260px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    button {
        cursor: pointer;
        svg {
            width: 24px;
            height: 24px;
            opacity: 0.3;

            &:hover {
                opacity: 1;
            }
        }
    }

    > .actions {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 5px;
    }
`;

export const ProjectSelector: FC = () => {
  const [flow, setFlow] = useRecoilState(flowState);
  const project = useRecoilValue(projectState);
  const [title, setTitle] = useState(project?.metadata.title);
  const [loadedState, setLoadedState] = useRecoilState(loadedProjectState);
  const [, setOpenOverlay] = useRecoilState(overlayOpenState);
  const [saving, setSaving] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { saveFlow, updateFlow } = useSaveFlow();
  const exportFlow = useExportFlow();

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
    setEditDialogOpen(true);
  }

  function onFLowDeleted() {
    setDeleteDialogOpen(false);
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
    setDeleteDialogOpen(true);
  }

  function handleImport() {
    loadProjectWithFileBrowser();
  }

  function handleExport() {
    exportFlow(flow);
  }

  function closeEditModal() {
    setEditDialogOpen(false);
  }

  function closeDeleteModal() {
    setDeleteDialogOpen(false);
  }

  function onFlowDeleted() {
    setDeleteDialogOpen(false);
    gotoList();
  }

  const handleEditUpdate = useStableCallback((update: Workflow) => {
    // note!! only update title, description, and mainGraphId (todo: labels)
    const title = update.name;
    const description = update.description;
    const mainGraphId = update.project.metadata.mainGraphId;
    setFlow({
      ...flow,
      name: title,
      description,
      project: {
        ...flow.project,
        metadata: {
          ...flow.project.metadata,
          title,
          description,
          mainGraphId,
        },
      },
    });
    setTitle(title);
    setLoadedState({
      ...loadedState,
      saved: false,
    });
  });
  
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
          <DropdownItem elemBefore={<FileImportIcon width={24} height={24}/>} onClick={handleImport}>Import</DropdownItem>
          <DropdownItem elemBefore={<ExportIcon label="export"/>} onClick={handleExport}>Export</DropdownItem>
          <DropdownItem elemBefore={<TrashIcon label="delete" />}
                        isDisabled={saving || !loadedState.saved}
                        onClick={handleDelete}>Delete</DropdownItem>
        </DropdownItemGroup>
      </DropdownMenu>
    );
  };

  return (
    <Fragment>
      <div css={styles}>
        <Button onClick={gotoList} appearance={"subtle"}>
          <LeftIcon />
        </Button>
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
      <EditFlowModal flow={flow} isOpen={editDialogOpen} onClose={closeEditModal} onSubmit={handleEditUpdate}/>
      {loadedState.saved &&
        <DeleteWorkflowModal workflow={flow} isOpen={deleteDialogOpen} onClose={closeDeleteModal} onFlowDeleted={onFLowDeleted}/>
      }
    </Fragment>
  );
};
