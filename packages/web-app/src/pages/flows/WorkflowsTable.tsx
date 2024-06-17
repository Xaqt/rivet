'use client';

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import ShortcutIcon from '@atlaskit/icon/core/shortcut';
import { type FindWorkflowsDto, type Workflow, WorkflowStatus } from '../../api/types';
import { Pagination } from '../../components/common/Pagination';
import { DownloadWorkflow } from './DownloadWorkflow';
import { formatDate } from '../../utils/time';
import { useDebounceFn } from 'ahooks';
import PageHeader from '@atlaskit/page-header';
import { SimpleTag } from '@atlaskit/tag';
import TagGroup from '@atlaskit/tag-group';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { workspaceState } from '../../state/auth';
import { DynamicTableStateless } from '@atlaskit/dynamic-table';
import Modal, { ModalBody, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import { workflowListState, workflowSearchCriteriaState } from '../../state/workflows';
import { workflowApi } from '../../api/api-client';
import { toast } from 'react-toastify';
import { getError } from '@ironclad/rivet-core';
import Button from '@atlaskit/button/new';
import EmptyState from '@atlaskit/empty-state';
import { ButtonGroup } from '@atlaskit/button';
import TextField from '@atlaskit/textfield';
import PlusIcon from '@atlaskit/icon/glyph/add';
import { newProjectModalOpenState, overlayOpenState } from '../../state/ui';
import { FlowContextMenu } from './FlowContextMenu';
import PreferencesIcon from '@atlaskit/icon/glyph/preferences';
import { settingsModalOpenState } from '../../components/SettingsModal';
import { css } from '@emotion/react';
import DeleteWorkflowModal from './DeleteWorkflowModal';
import { EditFlowModal } from '../../components/EditProjectModal';
import { useLoadFlow } from '../../hooks/useLoadFlow';
import { loadedProjectState } from '../../state/savedGraphs';
import FileImportIcon from '../../assets/icons/file-import-icon';
import { useLoadProjectWithFileBrowser } from '../../hooks/useLoadProjectWithFileBrowser';

const styles = css`
  .context-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .context-list-item {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-bottom: 1px solid var(--grey-darkish);
      border-left: 2px solid var(--grey-darkish);
    }
  }

  .context-list-actions {
    margin-top: 8px;
  }
    
  .workflow-list-container {
    display: flex;
    min-height: 25vh;
    flex-direction: column;
  }  
`;

const WorkflowTable = () => {
  const [loading, setLoading] = useState(false);
  const currentWorkspace = useRecoilValue(workspaceState);
  const [searchCriteria, setSearchCriteria] = useRecoilState(workflowSearchCriteriaState);
  const setNewProjectModalOpen = useSetRecoilState(newProjectModalOpenState);
  const [workflows, setWorkflows] = useRecoilState(workflowListState);
  const [pageIndex, setPageIndex] = useState(searchCriteria.page ?? 1);
  const [pageSize, setPageSize] = useState(searchCriteria.page_size || 20);
  const [totalCount, setTotalCount] = useState(0);
  const [workspaceId, setWorkspaceId] = useState(currentWorkspace?.workspace_id || '');
  const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.workspace_name || '');
  const [, setOpenOverlay] = useRecoilState(overlayOpenState);
  const [searchTerm, setSearchTerm] = useState<string>(searchCriteria.name || '');
  const setSettingsOpen = useSetRecoilState(settingsModalOpenState);
  
  const [selectedWorkflow, setSelectedWorkflow] =
    useState<Workflow>();

  const [clearTrigger, setClearTrigger] = useState(0);

  const [openDownloadModal, setOpenDownloadModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loadCounter, setLoadCounter] = useState<number>(0);
  const setLoadedProjectState = useSetRecoilState(loadedProjectState);

  const loadFlow = useLoadFlow();
  const loadProjectWithFileBrowser = useLoadProjectWithFileBrowser();

  const { run: runQuery, cancel: cancelQuery } = useDebounceFn((criteria?: FindWorkflowsDto) => {
    const findCriteria = criteria ?? searchCriteria;
    setLoading(true);
    workflowApi.find(workspaceId, findCriteria)
      .then((res) => {
        setTotalCount(res.total_count);
        setWorkflows(res.flows || []);
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
  };

  function handleSetPage(page: number) {
    setPageIndex(page);
    fetchWorkflows({ page });
  }

  function handleSetPageSize(size: number) {
    setPageSize(size);
    fetchWorkflows({ page_size: size });
  }

  function gotoGraphEditor(flow: Workflow) {
    console.log('goto graph editor', flow);
    const project = flow.project;
    loadFlow({
      workflow: flow,
      openedGraph: project.metadata.mainGraphId
    }).then(() => {
      setLoadedProjectState({
        loaded: true,
      });
      setOpenOverlay(undefined);
    }).catch((err) => {
      toast.error(getError(err).message);
    });
  }

  function handleSort({ key, sortOrder }: any) {
    const order = !sortOrder ? 'asc' : (sortOrder === 'ASC' ? 'asc' : 'desc');
    fetchWorkflows({ order_by: key, order });
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
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

  function handleImport() {
    // todo
    loadProjectWithFileBrowser();
    console.log('import');
  }

  function beginDeleteFlow(flow: Workflow) {
    setSelectedWorkflow(flow);
    setDeleteDialogOpen(true);
  }

  function beginEditFlow(flow: Workflow) {
    setSelectedWorkflow(flow);
    setEditDialogOpen(true);
  }

  function closeDeleteModal() {
    setDeleteDialogOpen(false);
  }

  function onFLowDeleted() {
    setDeleteDialogOpen(false);
    fetchWorkflows();
  }

  function closeEditModal() {
    setEditDialogOpen(false);
  }

  function onEditUpdate(update: Workflow) {
    const id = selectedWorkflow?.id;
    if (!id) {
      return;
    }
    const existing = workflows.find((flow) => flow.id === id);
    if (existing) {
      const title = update.name;
      const description = update.description;
      const mainGraphId = update.project.metadata.mainGraphId;
      existing.name = title;
      existing.description = description;
      existing.project.metadata.title = title;
      existing.project.metadata.mainGraphId = mainGraphId;
      setLoading(true);
      workflowApi.update(id, existing).then((updated) => {
        const idx = workflows.findIndex((flow) => flow.id === id);
        if (idx >= 0) {
          const flows = [...workflows];
          flows[idx] = updated;
          setWorkflows(flows);
        }
        toast.success('Flow updated');
      }).catch((e) => {
        const msg = getError(e).message;
        toast.error(`Failed to update flow: ${msg}`);
      }).finally(() => setLoading(false));
    }
  }

  const actionsContent = (
    <ButtonGroup label="Content actions">
      <TextField isCompact placeholder="Filter" aria-label="Filter" />
      <Button appearance="primary" iconBefore={PlusIcon} onClick={handleNewFlow}>Add New</Button>
      <Button appearance="primary" onClick={handleImport}>
        <FileImportIcon width={24} height={24}/>&nbsp;Import
      </Button>
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
          <div className="flex flex-row items-center space-x-2 truncate" onClick={() => gotoGraphEditor(flow)}>
            <div className="">{flow.name}</div>
          </div>
        ),
      },
      {
        key: `desc-${flow.id}`,
        content: (
          <div className="workflow-description" onClick={() => gotoGraphEditor(flow)}>
            {flow.description}
          </div>
        )
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
          <FlowContextMenu
            flow={flow}
            onStartEdit={beginEditFlow}
            onStartDelete={beginDeleteFlow}/>
        ),
      }
    ],
  })), [workflows]);

  useEffect(() => {
    setLoadCounter(0);
    runQuery();
  }, [currentWorkspace]);

  const head = createHead(false);
  return (
    <div css={styles}>
      <PageHeader
        actions={actionsContent}
      >
        <div>
          Flows: {workspaceName}
        </div>
      </PageHeader>

      <div className="workflow-list-container">
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
          onSort={handleSort}
          onSetPage={handleSetPage}
          emptyView={
            <EmptyState
              header="No flows available for workspace"
              description="Click above to add a flow."
              headingLevel={2}
            />
          }
        />
      </div>

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

      {selectedWorkflow &&
        <DeleteWorkflowModal
          workflow={selectedWorkflow}
          isOpen={deleteDialogOpen}
          onClose={closeDeleteModal}
          onFlowDeleted={onFLowDeleted}/>
      }

      {selectedWorkflow &&
        <EditFlowModal
          flow={selectedWorkflow}
          isOpen={editDialogOpen}
          onClose={closeEditModal}
          onSubmit={onEditUpdate}
        />
      }

    </div>
  );
};

export default WorkflowTable;
