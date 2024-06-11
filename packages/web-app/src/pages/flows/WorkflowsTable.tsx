'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DownloadIcon from '@atlaskit/icon/core/download';
import ShortcutIcon from '@atlaskit/icon/core/shortcut';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  type SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import BulkActions from './BulkActions';
import { UserIcon } from '@heroicons/react/20/solid';
import { useAuth } from '../../hooks/useAuth';
import { useWorkflows } from '../../hooks/useWorkflows';
import { type Workflow, WorkflowStatus } from '../../api/types';
import SidebarLayout from '../../components/common/SidebarLayout';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import ModalLayout from '../../components/common/ModalLayout';
import { Pagination } from '../../components/common/Pagination';
import { DeleteWorkflow } from './DeleteWorkflow';
import { DownloadWorkflow } from './DownloadWorkflow';
import { formatDate } from '../../utils/time';
import { useDebounce } from 'ahooks';
import { WorkflowElement } from './WorkflowElement';
import Button from '@atlaskit/button';
import { SimpleTag } from '@atlaskit/tag';
import TagGroup from '@atlaskit/tag-group';
import EmptyState from '@atlaskit/empty-state';
import ChevronUpIcon from 'majesticons/line/chevron-up-line.svg?react';
import ChevronUpDownIcon from '../../assets/icons/chevron-up-down-icon';
import RefreshIcon from '@atlaskit/icon/glyph/refresh';
import { useRecoilValue } from 'recoil';
import { workspaceState } from '../../state/auth';

const columnHelper = createColumnHelper<Workflow>();

const WorkflowTable = () => {
  const currentWorkspace = useRecoilValue(workspaceState);
  const {
    workflows,
    loading,
    fetchWorkflows,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    totalCount,
    searchCriteria
  } = useWorkflows();

  const [searchTerm, setSearchTerm] = useState<string>(searchCriteria.name || '');
  const debouncedSearchTerm = useDebounce(searchTerm, { wait: 500 });

  const [selectedWorkflow, setSelectedWorkflow] =
    useState<Workflow>();

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false },
  ]);
  const [clearTrigger, setClearTrigger] = useState(0);

  const [openDownloadModal, setOpenDownloadModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [loadCounter, setLoadCounter] = useState<number>(0);
  const [rowSelection, setRowSelection] = useState({});

  const handleRefresh = () => {
    if (currentWorkspace?.workspace_id) {
      fetchWorkflows();
      handleClearFilter();
    }
  };

  const handleCloseSidebar = () => {
    if (!openDeleteModal && !openDownloadModal) {
      setOpenSidebar(false);
    }
  };
  const handleCloseDownloadModal = () => {
    setOpenDownloadModal(false);
  };
  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };

  const handleClearFilter = () => {
    setSearchTerm('');
    setClearTrigger((prevState) => prevState + 1);
  };

  const handleDownloadWorkflow = (
    e: React.MouseEvent,
    workflow: Workflow
  ) => {
    e.stopPropagation();
    setSelectedWorkflow(workflow);
    setOpenDownloadModal(true);
  };

  function IndeterminateCheckbox({
                                   indeterminate,
                                   className = '',
                                   ...rest
                                 }: { indeterminate?: boolean } & React.HTMLProps<HTMLInputElement>) {
    const ref = React.useRef<HTMLInputElement>(null!);

    useEffect(() => {
      if (typeof indeterminate === 'boolean') {
        ref.current.indeterminate = !rest.checked && indeterminate;
      }
    }, [ref, indeterminate]);

    return (
      <input
        onClick={(event) => {
          event.stopPropagation();
        }}
        type="checkbox"
        ref={ref}
        className={className + ' cursor-pointer rounded-sm m-2'}
        {...rest}
      />
    );
  }

  // applied as rows in the form
  const rows = workflows.map((flow: Workflow, index: number) => ({
    key: `row-${flow.id}`,
    cells: [
      {
        key: `name-${flow.id}`,
        content: flow.name,
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
                flow.labels?.map((item, key) => <ShortcutIcon key={key} label={item.name}/>)
              }
            </TagGroup>
          </div>
        )
      },
      {
        key: `createdBy-${flow.id}`,
        content: flow.created_by,
      },
      {
        key: `updatedAt-${flow.id}`,
        content: formatDate(flow.updated_at),
      }
    ]
  }));

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: ({ table }) => {
          return (
            <div className="flex -ml-2 flex-row items-center">
              <IndeterminateCheckbox
                {...{
                  checked: table.getIsAllRowsSelected(),
                  indeterminate: table.getIsSomeRowsSelected(),
                  onChange: table.getToggleAllRowsSelectedHandler(),
                }}
              />
              <div className="flex ml-2 min-w-[66px]">Name</div>
            </div>
          );
        },
        cell: ({ getValue, row }) => {
          const name = getValue();
          return (
            <div className="flex flex-row items-center space-x-2 truncate">
              <IndeterminateCheckbox
                {...{
                  checked: row.getIsSelected(),
                  disabled: !row.getCanSelect(),
                  indeterminate: row.getIsSomeSelected(),
                  onChange: row.getToggleSelectedHandler(),
                }}
              />

              <div className="">{name}</div>
            </div>
          );
        },
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('description', {
        header: () => {
          return (
            <div className="flex flex-row items-center">
              <div className="flex">Description</div>
            </div>
          );
        },
        cell: ({ getValue }) => {
          const response = getValue();
          return (
            <div className="flex flex-row items-center space-x-2 truncate ">
              <div className="">{response ?? '-'}</div>
            </div>
          );
        },

        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('created_by', {
        header: () => {
          return (
            <div className="flex flex-row items-center">
              <div className="flex">Created By</div>
            </div>
          );
        },
        cell: ({ getValue }) => {
          const info = getValue();
          const photo = '';
          return (
            <div className="flex flex-row items-center space-x-2 truncate ">
              {photo ? (
                <div className="flex items-center justify-center overflow-hidden border rounded-full w-[18px] h-[18px]">
                  <img
                    src={photo}
                    alt={'photo'}
                    width={18}
                    height={18}
                    className="object-cover object-center w-full h-full"
                  />
                </div>
              ) : (
                <UserIcon className="p-1 border border-gray-600 rounded-full w-[18px] h-[18px]" />
              )}
              <div className="">
                {info}
              </div>
            </div>
          );
        },

        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('updated_at', {
        header: () => {
          return (
            <div className="flex flex-row items-center">
              <div className="flex min-w-[100px] ">Last Modified</div>
            </div>
          );
        },
        cell: (info) => {
          const data = info.row.original;
          return (
            <div className="flex flex-row items-center space-x-2 truncate">
              <div className="">{formatDate(data.updated_at)}</div>
            </div>
          );
        },

        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('labels', {
        header: () => {
          return (
            <div className="flex flex-row items-center">
              <div className="flex">Labels</div>
            </div>
          );
        },
        cell: ({ getValue }) => {
          const response = getValue() || [];
          return (
            <div className="flex flex-row items-center space-x-2 truncate">
              <TagGroup>
                {
                  response.map((item, key) => <ShortcutIcon key={key} label={item.name}/>)
                }
              </TagGroup>
            </div>
          );
        },

        footer: (info) => info.column.id,
      }),
    ],
    [sorting, workflows]
  );

  const table = useReactTable({
    data: workflows,
    columns,
    state: {
      rowSelection,
      sorting,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  });

  const fetchWorkflowsWithFilter = () => {
    if (currentWorkspace) {
      fetchWorkflows();
      setLoadCounter((prevCounter) => prevCounter + 1);
    }
  };

  useEffect(() => {
    if (selectedWorkflow) {
      const updatedSelectedWorkflow = workflows.find(
        (conv) => conv.id === selectedWorkflow.id
      );

      if (updatedSelectedWorkflow) {
        setSelectedWorkflow(updatedSelectedWorkflow);
      }
    }
  }, [workflows]);

  useEffect(() => setLoadCounter(0), [currentWorkspace]);

  useEffect(() => {
    fetchWorkflowsWithFilter();
  }, [
    pageSize,
    pageIndex,
    currentWorkspace,
    clearTrigger,
    debouncedSearchTerm,
  ]);

  return loadCounter <= 1 && workflows.length === 0 ? (
    loading ? (
      <LoadingSpinner />
    ) : (
      <div className="flex flex-col items-center justify-center min-h-screen rounded-lg h-96">
        <EmptyState
          header="No Flows Found"
          description="Go ahead and add one now."
          headingLevel={2}
          primaryAction={<Button appearance="primary">Add Flow</Button>}
        />
      </div>
    )
  ) : (
    <div className="flex flex-col h-screen p-12">
      <div className="flex flex-row items-center justify-between p-2 m-2">
        <div className="flex flex-row space-x-2 font-light leading-6">
          <p className="text-black text-2xl">Flows</p>
          {loading && <LoadingSpinner width={'7'} height={'7'} />}
        </div>

        <div className="flex flex-row items-center space-x-3">
          <button
            className="flex items-center justify-center size-7 rounded-full h-7 bg-primary hover:bg-opacity-90"
            onClick={handleRefresh}>
            <RefreshIcon label="refresh"/>
          </button>
          <div className="flex h-7">
            <BulkActions handleBulkAction={() => {}} />
          </div>
          <div className="relative w-52 bg-gray h-7">
            <input
              type="text"
              className="w-full pt-2 pl-6 pr-10 text-xs placeholder-gray-400 bg-gray-100 border border-transparent rounded-full shadow-sm outline-none h-7"
              placeholder="Workflow Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Button>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                   stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <ShortcutIcon label="shortcut"/>
              <span className="text-xs">Create Flow</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="max-h-screen min-w-full overflow-y-auto align-middle bg-white border rounded-xl">
        {workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-4 text-center text-gray-500">
            <div>No flows found.</div>
            <button
              onClick={handleClearFilter}
              className="flex w-[200px] items-center self-center justify-center text-sm text-center text-white bg-primary rounded-full h-7 bg-opacity-90 hover:bg-opacity-80">
              <p className="text-xs">Clear Filter</p>
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-gray-300 table-auto">
            <thead className={'sticky top-0 bg-white z-10'}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b ">
                {headerGroup.headers.map((header, index) => (
                  <th
                    scope="col"
                    className={`${
                      index === 0 ? 'pl-4' : 'pl-2'
                    } py-2 pr-2 text-xs font-light text-left text-black text-opacity-40 border-b `}
                    key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center'
                            : 'flex items-center',
                          onClick: header.column.getToggleSortingHandler(),
                        }}>
                        <div className="flex mx-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                        {{
                          asc: (
                            <ChevronUpDownIcon/>
                          ),
                          desc: (
                            <ChevronUpIcon label={"desc"}/>
                          ),
                        }[header.column.getIsSorted() as string] ?? (
                          <ChevronUpDownIcon />
                        )}
                      </div>
                    )}
                  </th>
                ))}
                <th
                  scope="col"
                  className="p-2 text-xs font-light text-center text-black text-opacity-40 "></th>
              </tr>
            ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
            {table?.getRowModel()?.rows?.map((row) => (
              <tr
                key={row.id}
                className="h-16 group hover:bg-gray-50"
                onClick={() => {
                  setSelectedWorkflow(row.original);
                  setOpenSidebar(true);
                }}>
                {row.getVisibleCells()?.map((cell, index, array) => (
                  <td
                    className={`${
                      index === array.length - 1
                        ? 'py-4'
                        : index === array.length - 2
                          ? 'py-4 pl-4'
                          : 'p-4'
                    } text-xs font-light text-textDefault whitespace-nowrap`}
                    key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
                <td className="py-2 p-2 text-sm font-light text-textDefault whitespace-nowrap">
                  <div className="flex flex-row justify-center min-w-[24px] cursor-pointer">
                    <span onClick={(e) =>
                      handleDownloadWorkflow(e, row.original)
                    }>
                        <DownloadIcon label="download"/>
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        )}
      </div>

      <ModalLayout
        open={openDownloadModal}
        width={'325px'}
        setOpen={handleCloseDownloadModal}>
        <DownloadWorkflow
          workflow={selectedWorkflow}
          setOpenModal={setOpenDownloadModal}
        />
      </ModalLayout>
      <ModalLayout
        open={openDeleteModal}
        width={'325px'}
        setOpen={handleCloseDeleteModal}>
        <DeleteWorkflow
          workflow={selectedWorkflow}
          setOpenModal={setOpenDeleteModal}
        />
      </ModalLayout>

      <SidebarLayout open={openSidebar} setOpen={handleCloseSidebar}>
        <WorkflowElement
          workflow={selectedWorkflow}
          setOpenSidebar={setOpenSidebar}
          setOpenDownloadModal={setOpenDownloadModal}
          setOpenDeleteModal={setOpenDeleteModal}
        />
      </SidebarLayout>

      <div className="flex-grow" />

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
  );
};

export default WorkflowTable;
