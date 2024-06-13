import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import React from 'react';
import EditIcon from '@atlaskit/icon/glyph/edit';
import SettingsCogIcon from 'majesticons/line/settings-cog-line.svg?react';
import CopyIcon from '@atlaskit/icon/glyph/copy';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import ExportIcon from '@atlaskit/icon/glyph/export';
import EditLineIcon from 'majesticons/line/edit-pen-2-line.svg?react';
import { Workflow } from '../../api/types';
import MoreVerticalIcon from '@atlaskit/icon/glyph/more-vertical'

export type FlowContextMenuProps = {
  flow: Workflow;
  onFlowDeleted?: () => void;
};

export const FlowContextMenu: React.FC<FlowContextMenuProps> = ({
  flow,
  onFlowDeleted,
}) => {

  function handleEdit() {
  }

  function handleEditProperties() {
  }

  function handleDuplicate() {

  }

  function handleExport() {

  }

  function handleDelete() {

  }

  return (
    <DropdownMenu<HTMLButtonElement>
      trigger={({ triggerRef, ...props }) => (
        <button {...props} ref={triggerRef}>
          <MoreVerticalIcon label="Actions" />
        </button>
      )}
      shouldFlip={true}
      shouldRenderToParent>
      <DropdownItemGroup>
        <DropdownItem elemBefore={<EditLineIcon label="new"/>} onClick={handleEditProperties}>Edit</DropdownItem>
        <DropdownItem elemBefore={<CopyIcon label="duplicate"/>} onClick={handleDuplicate}>Duplicate</DropdownItem>
        <DropdownItem elemBefore={<ExportIcon label="export"/>} onClick={handleExport}>Export</DropdownItem>
        <DropdownItem elemBefore={<TrashIcon label="delete" />} onClick={handleDelete}>Delete</DropdownItem>
      </DropdownItemGroup>
    </DropdownMenu>
  );
};
