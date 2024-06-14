import CrossIcon from '@atlaskit/icon/glyph/cross';
import type React from 'react';
import { type Workflow } from '../../api/types';
import { useWorkflows } from '../../hooks/useWorkflows';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import Button, { IconButton } from '@atlaskit/button/new';
import { useRecoilValue } from 'recoil';
import { flowState } from '../../state/savedGraphs';
import { getError } from '../../utils/errors';
import { toast } from 'react-toastify';

export interface DeleteWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  onFlowDeleted?: () => void;
  workflow?: Workflow | undefined;
}

const DeleteWorkflowModal: React.FC<DeleteWorkflowProps> = ({
  isOpen,
  onClose,
  onFlowDeleted,
  workflow,
}) => {
  const flow = useRecoilValue(flowState);
  workflow = workflow || flow;

  const { deleteWorkflow } = useWorkflows();

  function closeModal() {
    onClose();
  }

  const handleDelete = async () => {
    deleteWorkflow(
      workflow?.id!,
    ).then(() => {
      closeModal();
      onFlowDeleted?.();
      toast.success('Workflow deleted');
    })
    .then(closeModal)
    .catch((e) => {
      const msg = getError(e).message;
      const text = `Failed to delete workflow: ${msg}`;
      toast.error(text);
    });
  };

  return (
    <ModalTransition>
      {isOpen &&
      <Modal onClose={closeModal}>
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
          Are you sure you want to delete workflow &quot;{workflow.name}&quot;. &nbsp;
          <p/>
          This Action cannot be undone and will delete the flow forever.
        </ModalBody>
        <ModalFooter>
          <Button appearance="subtle" onClick={closeModal}>Cancel</Button>
          <Button appearance="primary" onClick={handleDelete}>Delete</Button>
        </ModalFooter>
      </Modal>
      }
    </ModalTransition>
  );
};

export default DeleteWorkflowModal;
