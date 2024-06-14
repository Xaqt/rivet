import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import type React from 'react';
import EditIcon from '@atlaskit/icon/glyph/edit';
import CopyIcon from '@atlaskit/icon/glyph/copy';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import ExportIcon from '@atlaskit/icon/glyph/export';
import EditLineIcon from 'majesticons/line/edit-pen-2-line.svg?react';
import { type Workflow } from '../../api/types';
import MoreHorizontalIcon from '@atlaskit/icon/glyph/more';

import Button from '@atlaskit/button/new';

export type FlowContextMenuProps = {
  flow: Workflow;
  onStartEdit?: (flow: Workflow) => void;
  onStartDelete?: (flow: Workflow) => void;
  onFlowDeleted?: () => void;
};

export const FlowContextMenu: React.FC<FlowContextMenuProps> = ({
  flow,
  onStartDelete,
  onStartEdit,
  onFlowDeleted,
}) => {

  function handleEdit() {
    onStartEdit?.(flow);
  }

  function handleEditProperties() {
  }

  function handleDuplicate() {

  }

  function handleExport() {

  }

  function handleDelete() {
    onStartDelete?.(flow);
  }

  return (
    <DropdownMenu<HTMLButtonElement>
      trigger={({ triggerRef, ...props }) => (
        <Button {...props} ref={triggerRef} appearance={"subtle"}>
          <MoreHorizontalIcon label="Actions" />
        </Button>
      )}
      shouldFlip={true}
      shouldRenderToParent>
      <DropdownItemGroup>
        <DropdownItem elemBefore={<EditLineIcon width={24} height={24} label="new"/>}
                      onClick={handleEditProperties}>Edit</DropdownItem>
        <DropdownItem elemBefore={<CopyIcon label="duplicate"/>} onClick={handleDuplicate}>Duplicate</DropdownItem>
        <DropdownItem elemBefore={<ExportIcon label="export"/>} onClick={handleExport}>Export</DropdownItem>
        <DropdownItem elemBefore={<TrashIcon label="delete" />} onClick={handleDelete}>Delete</DropdownItem>
      </DropdownItemGroup>
    </DropdownMenu>
  );
};
