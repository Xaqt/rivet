import React, { type FC, useState, Fragment, FormEvent } from 'react';
import Modal, { ModalBody, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import Form, { ErrorMessage, Field, FormFooter, FormHeader, RequiredAsterisk } from '@atlaskit/form';
import Button from '@atlaskit/button/loading-button';
import TextArea from '@atlaskit/textarea';
import { css } from '@emotion/react';
import TextField from '@atlaskit/textfield';
import { getError } from '@ironclad/rivet-core';
import { useStableCallback } from '../hooks/useStableCallback';

const styles = css`
    .editor {
        min-height: 400px;
        display: flex;
        resize: vertical;

        > div {
            width: 100%;
        }
    }
`;

type GraphEditModalProps = {
  open: boolean;
  name?: string;
  description?: string;
  onSubmit: (name: string, description?: string) => void | Promise<void>;
  onClose?: () => void;
};

export const GraphEditModal: FC<GraphEditModalProps> =
  ({ open, onSubmit, name, description, onClose }) => {
  const [fieldHasError, setFieldHasError] = useState(false);
  const [selectHasError, setSelectHasError] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');

  const errorMessages = {
    shortName: 'Please enter a name longer than 4 characters',
    validName: 'Nice one, this name is available',
    usernameInUse: 'This graph name is already taken, try entering another one',
    selectError: 'Please select a color',
  };


  const handleSubmit = ({ name, description }: { name: string, description: string }) => {
    Promise.resolve(
      onSubmit(name, description)
    ).catch((error) => {
      getError(error)
    });
  };

  const onNameChange = useStableCallback((e: FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
  });

  const onDescriptionChange = useStableCallback((e: FormEvent<HTMLTextAreaElement>) => {
    const value = e.currentTarget.value;
  });

  return (
    <ModalTransition>
      {open && (
        <Modal width="medium" onClose={onClose}>
          <ModalHeader>
            <ModalTitle>Edit Flow</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div css={styles}>
              <Form onSubmit={handleSubmit}>
                {({ formProps, submitting }) => (
                  <form noValidate {...formProps}>
                    <FormHeader title="Edit Graph">
                      <p aria-hidden="true">
                        Required fields are marked with an asterisk{' '}
                        <RequiredAsterisk />
                      </p>
                    </FormHeader>
                    <Field
                      aria-required={true}
                      name="name"
                      label="name"
                      defaultValue=""
                      isRequired
                    >
                      {({ fieldProps, error }) => (
                        <Fragment>
                          <TextField {...fieldProps} value={name} onChange={onNameChange}/>
                          {error && (
                            <ErrorMessage>
                              {error}
                            </ErrorMessage>
                          )}
                        </Fragment>
                      )}
                    </Field>
                    <Field<string, HTMLTextAreaElement> name="description" label="Description" defaultValue="">
                      {({ fieldProps, error }) => (
                        <Fragment>
                          <TextArea placeholder="Description" {...fieldProps} value={description} onChange={onDescriptionChange}/>
                          {error && <ErrorMessage>{error}</ErrorMessage>}
                        </Fragment>
                      )}
                    </Field>
                    <FormFooter>
                      <Button onClick={onClose}>Close</Button>
                      <Button
                        appearance="primary"
                        type="submit"
                        isLoading={submitting}
                      >
                        Submit
                      </Button>
                    </FormFooter>
                  </form>
                )}
              </Form>
            </div>
          </ModalBody>
        </Modal>
      )}
    </ModalTransition>
  );
};
