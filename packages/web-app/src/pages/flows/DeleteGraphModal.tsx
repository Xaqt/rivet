import CrossIcon from '@atlaskit/icon/glyph/cross';
import type React from 'react';
import { type Workflow } from '../../api/types';
import { useWorkflows } from '../../hooks/useWorkflows';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import Button, { IconButton } from '@atlaskit/button/new';
import { deleteGraphModalOpenState } from '../../state/ui';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { flowState } from '../../state/savedGraphs';

interface DeleteWorkflowProps {
  onGraphDeleted?: () => void;
  workflow?: Workflow | undefined;
}

export const DeleteGraphModalRenderer: React.FC<DeleteWorkflowProps> =
  ({
     onGraphDeleted,
     workflow,
   }) => {
    const deleteModalOpen = useRecoilValue(deleteGraphModalOpenState);

  return deleteModalOpen && <DeleteGraphModal onGraphDeleted={onGraphDeleted} workflow={workflow}/>;
};

export const DeleteGraphModal: React.FC<DeleteWorkflowProps> =
  ({
    onGraphDeleted,
    workflow,
  }) => {

  const flow = useRecoilValue(flowState);
  workflow = workflow || flow;

  const setDeleteProjectModalOpen = useSetRecoilState(deleteGraphModalOpenState);
  const { deleteWorkflow } = useWorkflows();

  function closeModal() {
    setDeleteProjectModalOpen(false);
  }

  const handleDelete = async () => {
    await deleteWorkflow(
      workflow?.id!,
    );
    onGraphDeleted?.();
    closeModal();
  };

  return (
    <ModalTransition>
      <Modal>
        <ModalHeader>
          <ModalTitle appearance="danger">Delete Workflow</ModalTitle>
          <IconButton
            appearance="subtle"
            onClick={closeModal}
            label="Close Modal"
            icon={CrossIcon}
          />
        </ModalHeader>
        <ModalBody>
          Are you sure you want to delete graph &quot;{workflow.name}&quot;. &nbsp;
          <p/>
          This Action cannot be undone and will delete the flow forever.
        </ModalBody>
        <ModalFooter>
          <Button appearance="subtle" onClick={closeModal}>Cancel</Button>
          <Button appearance="primary" onClick={handleDelete}>Delete</Button>
        </ModalFooter>
      </Modal>
    </ModalTransition>
  );
};
