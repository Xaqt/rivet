import { css } from '@emotion/react';
import { useState, type FC } from 'react';
import { useRecoilState } from 'recoil';
import { overlayOpenState } from '../../state/ui';
import { ErrorBoundary } from 'react-error-boundary';
import { SideNavigation, ButtonItem, Section } from '@atlaskit/side-navigation';

const styles = css`
  position: fixed;
  left: 250px;
  top: var(--project-selector-height);
  right: 0;
  bottom: 0;
  background: var(--grey-darker);
  padding: 64px 32px 0 32px;
  z-index: 150;

  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 16px;

  .main {
    display: grid;
    grid-template-columns: 250px 1fr;
    flex: 1 1 auto;
    column-gap: 16px;
    min-height: 0;
    overflow: hidden;
  }

  .selected-nav-area {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 0;
  }
`;

export const CommunityOverlayRenderer: FC = () => {
  const [openOverlay] = useRecoilState(overlayOpenState);

  if (openOverlay !== 'community') return null;

  return (
    <ErrorBoundary fallbackRender={() => 'Failed to render Community overlay'}>
      <CommunityOverlay />
    </ErrorBoundary>
  );
};

export const CommunityOverlay: FC = () => {
  const [selectedNav, setSelectedNav] = useState('community-templates');

  return (
    <div css={styles}>
      <h1>Rivet Community</h1>
      <div className="main">
        <SideNavigation label="Rivet Community">
          <Section title="Templates">
            <ButtonItem
              isSelected={selectedNav === 'community-templates'}
              onClick={() => setSelectedNav('community-templates')}
            >
              ⭐ Community Templates
            </ButtonItem>
          </Section>
          <Section title="Me">
            <ButtonItem isSelected={selectedNav === 'my-profile'} onClick={() => setSelectedNav('my-profile')}>
              My Profile
            </ButtonItem>
            <ButtonItem isSelected={selectedNav === 'my-templates'} onClick={() => setSelectedNav('my-templates')}>
              My Templates
            </ButtonItem>
          </Section>
          <Section title="Links">
            <ButtonItem>Discord</ButtonItem>
          </Section>
        </SideNavigation>
      </div>
    </div>
  );
};
