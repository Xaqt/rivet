import React, { useState, useEffect } from 'react';
import { ConversationCard } from '@/components/TaskDetail/ConversationCard';
import { ConversationTranscript } from '@/components/TaskDetail/ConversationTranscript';
import { AudioPlayer } from '@/components/TaskDetail/AudioPlayer';
import { LabelsSidebarManage } from '@/components/Labels/LabelsSidebarManage';
import { useTranscript } from '@/context/TranscriptContext';
import { ScrollArea } from '@radix-ui/themes';
import { useAuth } from '../../hooks/useAuth';
import { Workflow } from '../../api/types';

interface Props {
  workflow: Workflow | undefined;
  setOpenSidebar: (isOpen: boolean) => void;
  setOpenDownloadModal: (isOpen: boolean) => void;
  setOpenDeleteModal: (isOpen: boolean) => void;
}

export const ConversationElement: React.FC<Props> = ({
  workflow,
  setOpenSidebar,
  setOpenDownloadModal,
  setOpenDeleteModal,
}) => {
  const [isOpenAddLabelList, setIsOpenAddLabelList] = useState<boolean>(false);
  const { prompt, getTranscriptPrompt, setPrompt } = useTranscript();
  const { currentWorkspace } = useAuth();

  useEffect(() => {
    if (workflow?.recording && currentWorkspace?.workspace_id) {
      getTranscriptPrompt(
        workflow.recording.recording_id,
        currentWorkspace.workspace_id,
        '87e3d375-01c0-47bb-b17c-e12a99bc8269'
      );
    } else {
      setPrompt(null);
    }
    return () => {
      setPrompt(null);
    };
  }, [workflow]);

  return (
    <div className={'flex flex-col h-full'}>
      {isOpenAddLabelList ? (
        <LabelsSidebarManage
          conversationId={workflow!.conversation_id}
          closeSidebar={() => setOpenSidebar(false)}
          handleReturn={() => setIsOpenAddLabelList(false)}
          labelsIds={workflow!.labels.map(
            (label: { label_id: string }) => label.label_id
          )}
        />
      ) : (
        <>
          <ConversationCard
            conversation={workflow}
            setOpenSidebar={setOpenSidebar}
            setOpenDownloadModal={setOpenDownloadModal}
            setOpenDeleteModal={setOpenDeleteModal}
            setIsOpenAddLabelList={setIsOpenAddLabelList}
          />

          <ScrollArea
            className={
              'flex flex-col flex-grow border-y border-grayDefault gap-3'
            }>
            {/* {prompt && prompt.map((p) => <PromptCard prompt={p as Prompt} />)} */}
            <ConversationTranscript conversation={workflow!} />
          </ScrollArea>
        </>
      )}
    </div>
  );
};
