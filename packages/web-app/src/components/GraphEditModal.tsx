import React, { type FC, useEffect, useState, Fragment, FormEvent } from 'react';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import Form, { ErrorMessage, Field, FormFooter, FormHeader, HelperMessage, RequiredAsterisk } from '@atlaskit/form';
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

    .question pre {
        white-space: pre-wrap;
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
  const [fieldValue, setFieldValue] = useState('');
  const [fieldHasError, setFieldHasError] = useState(false);
  const [selectHasError, setSelectHasError] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [messageId, setMessageId] = useState('');

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
        <Modal width="x-large" onClose={onClose}>
          <ModalHeader>
            <ModalTitle>Edit Flow</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div css={styles}>
              <Form onSubmit={handleSubmit}>
                {({ formProps, submitting }) => (
                  <form noValidate {...formProps}>
                    <FormHeader title="Edit Flow">
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
                            <ErrorMessage testId="userSubmissionError">
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
                      <Button
                        appearance="primary"
                        type="submit"
                        isLoading={submitting}
                      >
                        Create Graph
                      </Button>
                    </FormFooter>
                  </form>
                )}
              </Form>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
            <Button type="submit">Submit</Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalTransition>
  );
};
