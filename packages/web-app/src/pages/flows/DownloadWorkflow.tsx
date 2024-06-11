import type React from 'react';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { type Workflow } from '../../api/types';
import { useWorkflows } from '../../hooks/useWorkflows';
import { kebabCase } from 'lodash-es';
import { exportTextToFile } from '../../io/utils';
import CrossIcon from '@atlaskit/icon/glyph/cross';

interface Props {
  setOpenModal: (isOpen: boolean) => void;
  workflow: Workflow | undefined;
}

export const DownloadWorkflow: React.FC<Props> = ({
  setOpenModal,
  workflow,
}) => {

  function getTitle(): string {
    const flow = workflow?.project;
    return workflow?.name || flow?.metadata?.title || 'flow';
  }

  const [title, setTitle] = useState(getTitle());
  const { getWorkflowById, loading } = useWorkflows();

  useEffect(() => {
    if (workflow?.id) {
      getWorkflowById(workflow?.id!).catch((error) => {
        console.error('Error fetching the workflow:', error);
      });
      setTitle(getTitle());
    } else {
      setTitle('');
    }
  }, [workflow]);

  const handleDownload = () => {
    setOpenModal(false);
    if (workflow?.project) {
      const serialized = JSON.stringify(workflow?.project);
      const filename = `${kebabCase(title)}.json`;
      exportTextToFile(serialized, filename, 'application/json');
    }
  };

  if (loading) {
    return (
      <div className={'flex justify-center w-[325px] h-[170px]'}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={'flex flex-col gap-4'}>
      <span className={'flex justify-between items-center'}>
        <span className={'text-xl'}>Download Flow</span>
        <CrossIcon label={'close'} />
      </span>
      <span className={'w-[325px] text-xs font-normal'}>
        Download the workflow with <br />{' '}
        <b>{title}?</b> <br />
      </span>
      <span className={'flex justify-between gap-2'}>
        <button
          onClick={() => setOpenModal(false)}
          className="flex w-full border border-borderPrimary items-center self-center justify-center text-sm text-center text-black rounded-full h-7 hover:border-grayDark hover:bg-hoverPrimary">
          <p className="text-xs">Cancel</p>
        </button>
        <button
          onClick={handleDownload}
          className="flex w-full items-center self-center justify-center text-sm text-center text-white bg-primary rounded-full h-7 bg-opacity-90 hover:bg-opacity-80">
          <p className="text-xs">Download</p>
        </button>
      </span>
    </div>
  );
};
