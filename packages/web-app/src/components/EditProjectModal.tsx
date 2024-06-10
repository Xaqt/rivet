import { useState, type FC, type FormEvent } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { editProjectModalOpenState } from '../state/ui';
import Modal, { ModalTransition, ModalBody, ModalHeader, ModalTitle, ModalFooter } from '@atlaskit/modal-dialog';
import { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import Button from '@atlaskit/button';
import Textarea from '@atlaskit/textarea';
import { projectState } from '../state/savedGraphs';
import { MainGraphSelect } from './common/MainGraphSelect';
import { type GraphId } from '@ironclad/rivet-core';

export const EditProjectModalRenderer: FC = () => {
  const [editProjectModalOpen] = useRecoilState(editProjectModalOpenState);

  return <ModalTransition>{editProjectModalOpen && <EditProjectModal />}</ModalTransition>;
};

export const EditProjectModal: FC = () => {
  const [project, setProject] = useRecoilState(projectState);
  const [projectName, setProjectName] = useState<string>(project?.metadata?.title);
  const [projectDescription, setProjectDescription] = useState<string>(project?.metadata?.description || '');
  const [mainGraphId, setMainGraphId] = useState<GraphId | undefined>(project?.metadata?.mainGraphId);

  const setEditProjectModalOpen = useSetRecoilState(editProjectModalOpenState);

  const closeModal = () => setEditProjectModalOpen(false);

  const updateProject = () => {
    // todo: validate fields.
    // setFlow
    setProject({
      ...project,
      metadata: {
        ...project.metadata,
        title: projectName,
        description: projectDescription,
        mainGraphId,
      },
    });
    closeModal();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProject();
  };

  function validateName(value: string) {
    if (!value.length) {
      return 'Project Name is required';
    }
    if (value.length < 6) {
      return 'Project Name is required to be at least 6 characters long';
    }
    return undefined;
  }

  return (
    <Modal onClose={closeModal} width="large">
      <ModalHeader>
        <ModalTitle>Edit Project</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit}>
          <Field name="projectName" label="Project Name">
            {() => (
              <TextField
                name="projectName"
                value={projectName}
                isRequired={true}
                onChange={(e) => setProjectName((e.target as HTMLInputElement).value)}
                placeholder="Project Name"
                autoComplete="off"
              />
            )}
          </Field>
          <Field name="projectDescription" label="Project Description (optional)">
            {() => (
              <Textarea
                name="projectDescription"
                placeholder="Project Description"
                autoComplete="off"
                value={projectDescription}
                onChange={(e) => setProjectDescription((e.target as HTMLTextAreaElement).value)}
              />
            )}
          </Field>
          <Field label="Main Graph" name="mainGraph">
            {() => (
              <MainGraphSelect onMainGraphChange={setMainGraphId} placeholder="Main Graph" />
            )}
          </Field>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button appearance="subtle" onClick={closeModal}>
          Cancel
        </Button>
        <Button appearance="primary" onClick={updateProject}>
          Submit
        </Button>
      </ModalFooter>
    </Modal>
  );
};
