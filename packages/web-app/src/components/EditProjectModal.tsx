import { useState, type FC, type FormEvent, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { editProjectModalOpenState } from '../state/ui';
import Modal, { ModalTransition, ModalBody, ModalHeader, ModalTitle, ModalFooter } from '@atlaskit/modal-dialog';
import { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Button from '@atlaskit/button';
import Textarea from '@atlaskit/textarea';
import { MainGraphSelect } from './common/MainGraphSelect';
import { type GraphId } from '@ironclad/rivet-core';
import { type Workflow, WorkflowImpl } from '../api/types';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import { IconButton } from '@atlaskit/button/new';

export interface EditProjectModalProps {
  flow?: Workflow;
  isOpen: boolean;
  onSubmit?: (flow: Workflow) => void;
  onClose: () => void;
}

export const EditFlowModal: FC<EditProjectModalProps> =
  ({
    flow,
    isOpen,
    onSubmit,
    onClose,
  }) => {
  const [project,] = useState(flow?.project);
  const [projectName, setProjectName] = useState<string>(project?.metadata?.title || '');
  const [projectDescription, setProjectDescription] = useState<string>(project?.metadata?.description || '');
  const [mainGraphId, setMainGraphId] = useState<GraphId | undefined>(project?.metadata?.mainGraphId);
  const [canSave, setCanSave] = useState<boolean>(false);
  const [isModified, setIsModified] = useState<boolean>(false);

  // todo labels

  const closeModal = () => onClose();

  function validateName(value: string) {
    if (!value.length) {
      return 'Flow Name is required';
    }
    if (value.length < 6) {
      return 'Project Name is required to be at least 6 characters long';
    }
    return undefined;
  }

  useEffect(() => {
    const changed = projectName !== project?.metadata?.title ||
      projectDescription !== project?.metadata?.description ||
      mainGraphId !== project?.metadata?.mainGraphId;
    setIsModified(changed);
    const isValid = validateName(projectName) === undefined;
    setCanSave(changed && isValid);
  }, [projectName, projectDescription, mainGraphId]);

  const updateProject = () => {
    // todo: validate fields.
    // setFlow
    flow = flow || new WorkflowImpl();
    flow.name = projectName;
    flow.description = projectDescription;
    flow.project.metadata.title = projectName;
    flow.project.metadata.description = projectDescription;
    flow.project.metadata.mainGraphId = mainGraphId;

    onSubmit?.(flow);
    closeModal();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProject();
  };

  const verb = project ? 'Edit' : 'Create';
  const buttonVerb = project ? 'Save' : 'Create';

  return (
    <ModalTransition>
      {isOpen &&
      <Modal onClose={closeModal} width="medium">
        <ModalHeader>
          <ModalTitle>{verb} Flow</ModalTitle>
          <IconButton
            appearance="subtle"
            onClick={closeModal}
            label="Close Modal"
            icon={CrossIcon}
          />
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <Field name="projectName" label="Flow Name">
              {() => (
                <TextField
                  name="projectName"
                  value={projectName}
                  isRequired={true}
                  onChange={(e) => setProjectName((e.target as HTMLInputElement).value)}
                  placeholder="Flow Name"
                  autoComplete="off"
                />
              )}
            </Field>
            <Field name="projectDescription" label="Description (optional)">
              {() => (
                <Textarea
                  name="projectDescription"
                  placeholder="Flow Description"
                  autoComplete="off"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription((e.target as HTMLTextAreaElement).value)}
                />
              )}
            </Field>
            {flow &&
            <Field label="Main Graph" name="mainGraph">
              {() => (
                <MainGraphSelect onMainGraphChange={setMainGraphId} placeholder="Main Graph" />
              )}
            </Field>
            }
          </form>
        </ModalBody>
        <ModalFooter>
          <Button appearance="subtle" onClick={closeModal}>
            Cancel
          </Button>
          <Button appearance="primary" onClick={updateProject} isDisabled={!canSave}>
            {buttonVerb}
          </Button>
        </ModalFooter>
      </Modal>
      }
    </ModalTransition>
  );
};
