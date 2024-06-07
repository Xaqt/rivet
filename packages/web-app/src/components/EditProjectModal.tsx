import { type FC, useEffect, useState, Fragment } from 'react';
import { type ArrayDataValue, type StringDataValue } from '@ironclad/rivet-core';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import Form, { ErrorMessage, Field, FormFooter, FormHeader, HelperMessage, RequiredAsterisk } from '@atlaskit/form';
import Button from '@atlaskit/button/loading-button';
import TextArea from '@atlaskit/textarea';
import { css } from '@emotion/react';
import TextField from '@atlaskit/textfield';

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

type EditProjectModalProps = {
  open: boolean;
  name?: string;
  description?: string;
  onSubmit: (name: string, description?: string) => void;
  onClose?: () => void;
};

let isUsernameUsed: boolean = false;

export const EditProjectModal: FC<EditProjectModalProps> =
  ({ open, onSubmit, name, description, onClose }) => {
  const [fieldValue, setFieldValue] = useState('');
  const [fieldHasError, setFieldHasError] = useState(false);
  const [selectHasError, setSelectHasError] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [messageId, setMessageId] = useState('');

  const errorMessages = {
    shortName: 'Please enter a name longer than 4 characters',
    validName: 'Nice one, this name is available',
    usernameInUse: 'This flow name is already taken, try entering another one',
    selectError: 'Please select a color',
  };

  const handleBlurEvent = () => {
    isUsernameUsed = checkUserName(fieldValue);
    if (fieldValue.length >= 5 && !isUsernameUsed) {
      setFieldHasError(false);
      setErrorMessageText('IS_VALID');
    } else {
      setFieldHasError(true);
      if (fieldValue.length <= 5) {
        setErrorMessageText('TOO_SHORT');
      } else if (isUsernameUsed) {
        setErrorMessageText('IN_USE');
      }
    }
  };


  const handleSubmit = () => {
    // onSubmit(results);
  };

  useEffect(() => {
    switch (errorMessageText) {
      case 'IS_VALID':
        setMessageId('-valid');
        break;
      case 'TOO_SHORT':
      case 'IN_USE':
        setMessageId('-error');
        break;
      default:
        setMessageId('-error');
    }
  }, [errorMessageText]);

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
                          <TextField {...fieldProps} value={name}/>
                          {!error && (
                            <HelperMessage>Try 'jsmith' or 'mchan'</HelperMessage>
                          )}
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
                          <TextArea placeholder="Description" {...fieldProps} value={description} />
                          {!error && (
                            <HelperMessage>Must contain @ symbol</HelperMessage>
                          )}
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
                        Create account
                      </Button>
                    </FormFooter>
                  </form>
                )}
              </Form>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalTransition>
  );
};
