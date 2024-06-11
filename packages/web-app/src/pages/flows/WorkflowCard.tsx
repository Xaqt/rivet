import type React from 'react';
import { useState } from 'react';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import CalendarIcon from '@atlaskit/icon/core/calendar';
import { type Workflow } from '../../api/types';
import { useAuth } from '../../hooks/useAuth';
import { getWorkflowTitle } from './utils';
import { formatDate } from '../../utils/time';
import { useWorkflows } from '../../hooks/useWorkflows';
import { FlowTags } from './FlowTags';
import DownloadIcon from '@atlaskit/icon/core/download';

interface Props {
  workflow: Workflow | undefined;
  setOpenSidebar: (isOpen: boolean) => void;
  setOpenDownloadModal: (isOpen: boolean) => void;
  setOpenDeleteModal: (isOpen: boolean) => void;
  setIsOpenAddLabelList: (isOpen: boolean) => void;
}

export const WorkflowCard: React.FC<Props> = ({
  workflow,
  setOpenSidebar,
  setOpenDownloadModal,
  setOpenDeleteModal,
  setIsOpenAddLabelList,
}) => {
  const [title, setTitle] = useState(getWorkflowTitle(workflow));
  const { removeWorkflowLabel } = useWorkflows();
  const { currentWorkspace } = useAuth();

  const handleRemoveLabel = async (labelId: string) => {
    if (!currentWorkspace || !workflow) return;
    await removeWorkflowLabel(workflow?.id, labelId);
  };

  return (
    <>
      <div className={'flex flex-col p-6 gap-6'}>
        <div className={'flex flex-col'}>
          <div className={'flex justify-between items-center'}>
            <div className={'font-light text-2xl'}>Flow</div>
            <CrossIcon label={'close'}/>
          </div>
          <div className={'text-primary font-normal text-2xl'}>
            {title}
          </div>
        </div>
        <div className={'flex flex-col gap-4'}>
          <div className={'flex justify-between items-center'}>
            <div className="flex gap-2 items-center">
              {/*{workflow?.agent.photo && (*/}
              {/*  <Image*/}
              {/*    src={workflow?.agent.photo}*/}
              {/*    alt={workflow.agent.firstName}*/}
              {/*    width={18}*/}
              {/*    height={18}*/}
              {/*    className={*/}
              {/*      "object-cover object-center border rounded-full h-[18px]"*/}
              {/*    }*/}
              {/*  />*/}
              {/*)}*/}
              <div
                className={
                  'flex items-center justify-center text-xs rounded-full bg-grayLighter w-5 h-5'
                }>
                {workflow?.created_by}
              </div>
            </div>
            <div
              className={
                'text-xs text-textDefault text-opacity-40 font-normal'
              }>
              {workflow?.description}
            </div>
          </div>
          <div className={'flex justify-between items-center'}>
            <div className={'flex items-center gap-1'}>
              <CalendarIcon label="calendar" />
              <div className={'text-xs text-textDefault font-normal'}>
                {formatDate(workflow?.created_at)}
              </div>
            </div>
            <div className={'flex gap-4'}>
              <DownloadIcon label="download" />
            </div>
          </div>
          <div
            className={
              'flex items-center text-xs text-textDefault font-normal justify-between'
            }>
            <div>Engagement ID:</div>
            <div>
              Some stuff here
            </div>
          </div>
        </div>

        {workflow && (
          <FlowTags
            limit={false}
            tags={workflow!.labels.map((el) => el.label_id)}
            openAddList={() => setIsOpenAddLabelList(true)}
            isShowDeleteOpt
            handleRemoveLabel={handleRemoveLabel}
          />
        )}
      </div>
    </>
  );
};
