'use client';

import React, { useState, useEffect, useMemo, Fragment } from 'react';
import ShortcutIcon from '@atlaskit/icon/core/shortcut';
import { type FindWorkflowsDto, type Workflow, WorkflowStatus } from '../../api/types';
import { Pagination } from '../../components/common/Pagination';
import { DownloadWorkflow } from './DownloadWorkflow';
import { formatDate } from '../../utils/time';
import { useDebounce, useDebounceFn } from 'ahooks';
import PageHeader from '@atlaskit/page-header';
import { SimpleTag } from '@atlaskit/tag';
import TagGroup from '@atlaskit/tag-group';
import RefreshIcon from '@atlaskit/icon/glyph/refresh';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { workspaceState } from '../../state/auth';
import { DynamicTableStateless } from '@atlaskit/dynamic-table';
import Modal, { ModalBody, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import { workflowListState, workflowSearchCriteriaState } from '../../state/workflows';
import { workflowApi } from '../../api/api-client';
import { toast } from 'react-toastify';
import { getError } from '@ironclad/rivet-core';
import ChildIssuesIcon from '@atlaskit/icon/glyph/child-issues';
import Button from '@atlaskit/button/new';
import EmptyState from '@atlaskit/empty-state';
import { ButtonGroup } from '@atlaskit/button';
import { Box, Inline, xcss } from '@atlaskit/primitives';
import TextField from '@atlaskit/textfield';
import PlusIcon from '@atlaskit/icon/glyph/add';
import { newProjectModalOpenState, overlayOpenState } from '../../state/ui';
import { type MenuIds, useRunMenuCommand } from '../../hooks/useMenuCommands';
import { FlowContextMenu } from './FlowContextMenu';
import PreferencesIcon from '@atlaskit/icon/glyph/preferences'
import { settingsModalOpenState } from '../../components/SettingsModal';
import { useRemoteDebugger } from '../../hooks/useRemoteDebugger';

const WorkflowTable = () => {
  const [loading, setLoading] = useState(false);
  const currentWorkspace = useRecoilValue(workspaceState);
  const [searchCriteria, setSearchCriteria] = useRecoilState(workflowSearchCriteriaState);
  const setNewProjectModalOpen = useSetRecoilState(newProjectModalOpenState);
  const [workflows, updateWorkflows] = useRecoilState(workflowListState);
  const [pageIndex, setPageIndex] = useState(searchCriteria.page ?? 1);
  const [pageSize, setPageSize] = useState(searchCriteria.page_size || 20);
  const [totalCount, setTotalCount] = useState(0);
  const [workspaceId, setWorkspaceId] = useState(currentWorkspace?.workspace_id || '');
  const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.workspace_name || '');
  const [, setOpenOverlay] = useRecoilState(overlayOpenState);
  const [searchTerm, setSearchTerm] = useState<string>(searchCriteria.name || '');
  const debouncedSearchTerm = useDebounce(searchTerm, { wait: 500 });
  const setSettingsOpen = useSetRecoilState(settingsModalOpenState);
  
  const runMenuCommandImpl = useRunMenuCommand();
  
  const runCommand = (cmd: MenuIds) => {
    runMenuCommandImpl(cmd);
  };
  
  const [selectedWorkflow, setSelectedWorkflow] =
    useState<Workflow>();

  const [clearTrigger, setClearTrigger] = useState(0);

  const [openDownloadModal, setOpenDownloadModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [loadCounter, setLoadCounter] = useState<number>(0);

  const { run: runQuery, cancel: cancelQuery } = useDebounceFn((criteria?: FindWorkflowsDto) => {
    const findCriteria = criteria ?? searchCriteria;
    setLoading(true);
    workflowApi.find(workspaceId, findCriteria)
      .then((res) => {
        setTotalCount(res.total_count);
        updateWorkflows(res.flows || []);
        setSearchCriteria(findCriteria);
        return res;
      }).catch(err => {
      toast.error(getError(err).message);
    }).finally(() => setLoading(false));
  }, {
    wait: 350
  });

  // cancel any running query on unmount
  useEffect(() => {
    return cancelQuery;
  }, []);

  const fetchWorkflows = (criteria?: Partial<FindWorkflowsDto>) => {
    const findCriteria = {
      ...searchCriteria,
      ...(criteria || {}),
    } as FindWorkflowsDto;

    setSearchCriteria(findCriteria);
    return runQuery(findCriteria);
  };

  const handleRefresh = () => {
    if (currentWorkspace?.workspace_id) {
      fetchWorkflows();
      handleClearFilter();
    }
  };

  const handleCloseDownloadModal = () => {
    setOpenDownloadModal(false);
  };

  const handleClearFilter = () => {
    setSearchTerm('');
    setClearTrigger((prevState) => prevState + 1);
  };

  const openSettings = () => {
    setSettingsOpen(true);
    console.log('open settings');
  }

  const handleDownloadWorkflow = (
    e: React.MouseEvent,
    workflow: Workflow,
  ) => {
    e.stopPropagation();
    setSelectedWorkflow(workflow);
    setOpenDownloadModal(true);
  };

  const handleNewFlow = () => {
    // todo
    setNewProjectModalOpen(true);
    setOpenOverlay(undefined);
  };

  const flexBoxStyles = xcss({
    flex: '0 0 20px',
  });

  const actionsContent = (
    <ButtonGroup label="Content actions">
      <TextField isCompact placeholder="Filter" aria-label="Filter" />
      <Button appearance="primary" iconBefore={PlusIcon} onClick={handleNewFlow}>Add New</Button>
      <Button appearance="subtle" iconBefore={PreferencesIcon} onClick={openSettings}>&nbsp;</Button>
    </ButtonGroup>
  );

  const createHead = (withWidth: boolean) => {
    return {
      cells: [
        {
          key: 'name',
          content: 'Name',
          isSortable: true,
          width: withWidth ? 25 : undefined,
        },
        {
          key: 'Description',
          content: 'Description',
          shouldTruncate: true,
          isSortable: true,
          width: withWidth ? 15 : undefined,
        },
        {
          key: 'labels',
          content: 'Labels',
          shouldTruncate: true,
          isSortable: true,
          width: withWidth ? 10 : undefined,
        },
        {
          key: 'created_by',
          content: 'Created By',
          shouldTruncate: true,
        },
        {
          key: 'updated_at',
          content: 'Last Modified',
          shouldTruncate: true,
        },
        {
          key: 'status',
          content: 'Status',
          shouldTruncate: true,
        },
        {
          key: 'actions',
          content: 'Actions',
          shouldTruncate: true,
          width: withWidth ? 200 : undefined,
        }
      ],
    };
  };

  // applied as rows in the form
  const rows = useMemo(() => workflows.map((flow: Workflow, index: number) => ({
    key: `row-${flow.id}`,
    cells: [
      {
        key: `name-${flow.id}`,
        content: (
          <div className="flex flex-row items-center space-x-2 truncate">
            <div className="">{flow.name}</div>
          </div>
        ),
      },
      {
        key: `desc-${flow.id}`,
        content: flow.description,
      },
      {
        key: `tags-${flow.id}`,
        content: (
          <div className="flex flex-row items-center space-x-2 truncate">
            <TagGroup>
              {
                flow.labels?.map((item, key) => <ShortcutIcon key={key} label={item.name} />)
              }
            </TagGroup>
          </div>
        ),
      },
      {
        key: `createdBy-${flow.id}`,
        content: flow.created_by,
      },
      {
        key: `updatedAt-${flow.id}`,
        content: (
          <div className="flex flex-row items-center space-x-2 truncate">
            <div className="">{formatDate(flow.updated_at)}</div>
          </div>
        ),
      },
      {
        key: `status-${flow.id}`,
        content: (
          <div className="flex flex-row items-center space-x-2 truncate">
            <SimpleTag
              appearance="rounded"
              text={flow.status}
              color={flow.status === WorkflowStatus.ACTIVE ? 'green' : 'standard'}
            />
          </div>
        ),
      },
      {
        key: `actions-${flow.id}`,
        content: (
          <FlowContextMenu flow={flow} />
        ),
      }
    ],
  })), [workflows]);

  const fetchWorkflowsWithFilter = () => {
    if (currentWorkspace && !loading) {
      fetchWorkflows();
      setLoadCounter((prevCounter) => prevCounter + 1);
    }
  };

  useEffect(() => {
    setLoadCounter(0);
    runQuery();
  }, [currentWorkspace]);

  const head = createHead(false);
  return (
    <Fragment>
      <PageHeader
        actions={actionsContent}
      >
        <div>
          Flows for Workspace: {workspaceName}
        </div>
      </PageHeader>

      <DynamicTableStateless
        rows={rows}
        head={head}
        rowsPerPage={pageSize}
        page={pageIndex}
        totalRows={totalCount}
        loadingSpinnerSize="large"
        isLoading={loading}
        isFixedSize
        sortKey="updated_at"
        sortOrder="DESC"
        onSort={() => console.log('onSort')}
        onSetPage={() => console.log('onSetPage')}
        emptyView={
            <EmptyState
              header="No flows available for workspace"
              description="Click above to add a flow."
              headingLevel={2}
            />
        }
      />

      {openDownloadModal && (
      <ModalTransition>
        <Modal onClose={handleCloseDownloadModal}>
          <ModalHeader>
            <ModalTitle>Download</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <DownloadWorkflow
              workflow={selectedWorkflow}
              setOpenModal={setOpenDownloadModal}
            />
          </ModalBody>
        </Modal>
      </ModalTransition>
      )}

      <div className="flex-grow">
        {/* Pagination */}
        <Pagination
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalCount={totalCount}
          disabled={loading}
        />
      </div>

    </Fragment>
  );
};

export default WorkflowTable;
