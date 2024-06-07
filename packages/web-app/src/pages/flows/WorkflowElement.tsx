import type React from 'react';
import { useState, useEffect } from 'react';
import { type Workflow } from '../../api/types';
import { WorkflowCard } from './WorkflowCard';

interface Props {
  workflow: Workflow | undefined;
  setOpenSidebar: (isOpen: boolean) => void;
  setOpenDownloadModal: (isOpen: boolean) => void;
  setOpenDeleteModal: (isOpen: boolean) => void;
}

export const WorkflowElement: React.FC<Props> = ({
  workflow,
  setOpenSidebar,
  setOpenDownloadModal,
  setOpenDeleteModal,
}) => {
  const [isOpenAddLabelList, setIsOpenAddLabelList] = useState<boolean>(false);
  return (
    <div className={'flex flex-col h-full'}>
      <WorkflowCard
        workflow={workflow}
        setOpenSidebar={setOpenSidebar}
        setOpenDownloadModal={setOpenDownloadModal}
        setOpenDeleteModal={setOpenDeleteModal}
        setIsOpenAddLabelList={setIsOpenAddLabelList}
      />
    </div>
  );
};
