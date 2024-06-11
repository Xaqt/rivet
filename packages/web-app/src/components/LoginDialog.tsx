import React, {
  type ChangeEvent,
  type FormEvent,
  Fragment,
  useCallback,
  useEffect,
  useState,
} from 'react';

import Button, { IconButton } from '@atlaskit/button/new';
import CrossIcon from '@atlaskit/icon/glyph/cross';

import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from '@atlaskit/modal-dialog';
import { Field } from '@atlaskit/form';
import Textfield from '@atlaskit/textfield';
import { useRecoilState, useRecoilValue } from 'recoil';
import { loginDialogOpenState } from '../state/ui';
import ErrorIcon from '@atlaskit/icon/core/error';
import Banner from '@atlaskit/banner';
import { getError } from '../utils/errors';
import { authApi } from '../api/api-client';
import { useAuth } from '../hooks/useAuth';

export function RenderLoginDialog() {
  const loginDialogOpen = useRecoilValue(loginDialogOpenState);
  if (!loginDialogOpen) {
    return null;
  }
  return (
    <LoginDialog />
  );
}

export function LoginDialog() {
  const [isOpen, setIsOpen] = useRecoilState(loginDialogOpenState);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { fetchCurrentUser } = useAuth();
  
  const closeModal = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const canSubmit = username.length > 3 && password.length > 3;
    setCanSubmit(canSubmit);
  }, [username, password]);

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }
    authApi.login(username, password)
      .then(fetchCurrentUser)
      .then(closeModal)
      .catch(err => {
        const msg = getError(err).message;
        setErrorMessage(msg);
      });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    handleSubmit();
  }

  function onUsernameChange(event: ChangeEvent<HTMLInputElement>) {
    setUsername(event.target.value);
  }

  function onPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }
  
  return (
    <ModalTransition>
      <Modal onClose={closeModal}>
        <ModalHeader>
          <ModalTitle>Login</ModalTitle>
          <IconButton
            appearance="subtle"
            onClick={closeModal}
            label="Close Modal"
            icon={CrossIcon}
          />
        </ModalHeader>
        <ModalBody>
          <form onSubmit={onSubmit}>
            <Field id="username" name="username" label="Type your username to continue">
              {({ fieldProps }) => (
                <Fragment>
                  <Textfield
                    {...fieldProps}
                    value={undefined}
                    isRequired={true}
                    onChange={onUsernameChange}
                  />
                </Fragment>
              )}
            </Field>

            <Field id="password" name="password">
              {({ fieldProps }) => (
                <Fragment>
                  <Textfield
                    {...fieldProps}
                    value={undefined}
                    isRequired={true}
                    onChange={onPasswordChange}
                  />
                </Fragment>
              )}
            </Field>
          </form>
          <div>
          {errorMessage && (
            <Banner
              appearance="error"
              icon={<ErrorIcon label="Error" />}
            >
              {errorMessage}
            </Banner>
          )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button appearance="subtle" onClick={closeModal}>Cancel</Button>
          <Button appearance="primary" onClick={handleSubmit} isDisabled={!canSubmit}>
            Login
          </Button>
        </ModalFooter>
      </Modal>
    </ModalTransition>
  );
}
