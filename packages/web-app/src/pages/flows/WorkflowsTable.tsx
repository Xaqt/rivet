'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import column_sort from '@/assets/column_sort.svg';
import search_icon from '@/assets/search_icon_gray.svg';
import play from '@/assets/play.svg';
import subtitlesIcon from '@/assets/subtitles.svg';
import download from '@/assets/download.svg';
import shortcut_icon from '@/assets/shortcut_icon_gray.svg';
import folder_not_found from '@/assets/folder_not_found.svg';
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
import CustomHoverCard from '@/components/TaskDetail/CustomHoverCard';
import { ConversationElement } from '@/components/TaskDetail/ConversationElement';
import refresh_icon from '@/assets/refresh_icon.svg';
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

const columnHelper = createColumnHelper<Workflow>();
const WorkflowTable = () => {
  const { currentWorkspace } = useAuth();
  const {
    workflows,
    loading,
    fetchWorkflows,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    totalCount,
    searchTerm,
    setSearchTerm,
  } = useWorkflows();

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  const [selectedWorkflow, setSelectedWorkflow] =
    useState<Workflow>();

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'conversation_start_time', desc: true },
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

  const handleDownloadWorkflows = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
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

  const columns = useMemo(
    () => [
      columnHelper.accessor('conversation_start_time', {
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
              <div className="flex ml-2 min-w-[66px]">Date & Time</div>
            </div>
          );
        },
        cell: ({ getValue, row }) => {
          const date = getValue();
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

              <div className="">{formatDate(date)}</div>
            </div>
          );
        },
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('queue.queue_name', {
        header: () => {
          return (
            <div className="flex flex-row items-center">
              <div className="flex">Queue</div>
            </div>
          );
        },
        cell: ({ getValue }) => {
          const response = getValue();
          return (
            <div className="flex flex-row items-center space-x-2 truncate ">
              <div className="">{response ? response : '-'}</div>
            </div>
          );
        },

        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('caller_info.call_direction', {
        header: () => {
          return (
            <div className="flex flex-row items-center">
              <div className="flex">Direction</div>
            </div>
          );
        },
        cell: ({ getValue }) => {
          const response = getValue();
          return (
            <div className="flex flex-row items-center space-x-2 truncate">
              <div>{response ? response : '-'}</div>
            </div>
          );
        },
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('agent', {
        header: () => {
          return (
            <div className="flex flex-row items-center">
              <div className="flex">Agent</div>
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
                {info && info.first_name ? info.first_name : '-'}{' '}
                {info && info.last_name ? `${info.last_name[0]}.` : ''}
              </div>
            </div>
          );
        },

        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('caller_info.ANI', {
        header: () => {
          return (
            <div className="flex flex-row items-center">
              <div className="flex min-w-[100px] ">Customer Number</div>
            </div>
          );
        },
        cell: (info) => {
          const data = info.row.original;
          const view =
            data.caller_info.call_direction === 'inbound'
              ? data.caller_info.ANI
              : data.caller_info.dialed_number;
          return (
            <div className="flex flex-row items-center space-x-2 truncate">
              <div className="">{view ? transformToUSFormat(view) : '-'}</div>
            </div>
          );
        },

        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('conversationTalkDuration', {
        header: () => {
          return (
            <div className="flex flex-row items-center">
              <div className="flex">Media</div>
            </div>
          );
        },
        cell: (info) => {
          const data = info.row.original;
          return (
            <div className="flex flex-row min-w-[65px] items-center truncate ">
              <div className="mr-1.5 min-w-[30px]">
                {data.conversationTalkDuration
                  ? transformDate(data.conversationTalkDuration, 'm-s')
                  : transformDate(data.duration, 'm-s')}
              </div>
              {data && data.recording && data.recording.recording_id && (
                <CustomHoverCard
                  triger={
                    <Image src={play} alt={'audio'} width={16} height={16} />
                  }
                  content={'Contains Audio'}
                />
              )}
              {data && data.recording && data.recording.transcript_url && (
                <CustomHoverCard
                  triger={
                    <Image
                      src={subtitlesIcon}
                      alt={'subtitles'}
                      width={16}
                      height={16}
                    />
                  }
                  content={'Contains Transcription'}
                />
              )}
            </div>
          );
        },

        footer: (info) => info.column.id,
      }),
      columnHelper.accessor('disposition', {
        header: () => {
          return (
            <div className="flex flex-row items-center">
              <div className="flex">Disposition</div>
            </div>
          );
        },
        cell: ({ getValue }) => {
          const response = getValue();
          return (
            <div className="flex flex-row items-center space-x-2 truncate">
              <div className="">{response ? response : '-'}</div>
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
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const fetchWorkflowsWithFilter = async () => {
    if (currentWorkspace) {
      await fetchWorkflows();
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
        <Image
          src={folder_not_found}
          alt="noFolderIcon"
          width={110}
          height={110}
        />
        <p className="m-3 text-xs font-semibold text-center text-gray-700 w-60">
          Workflows
          <br />
        </p>{' '}
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
            <Image src={refresh_icon} alt="" height={14} />
          </button>
          <div className="flex h-7">
            <BulkActions handleBulkAction={() => {}} />
          </div>
          <div className="relative w-52 bg-gray h-7">
            <Image
              src={search_icon}
              alt="searchIcon"
              height={13}
              width={13}
              className="absolute transform -translate-y-1/2 left-2 top-1/2"
            />
            <input
              type="text"
              className="w-full pt-2 pl-6 pr-10 text-xs placeholder-gray-400 bg-gray-100 border border-transparent rounded-full shadow-sm outline-none h-7"
              placeholder="Workflow Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Image
              src={shortcut_icon}
              alt="shortcutIcon"
              height={18}
              width={18}
              className="absolute transform -translate-y-1/2 right-2 top-1/2"
            />
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
                            <Image
                              src={column_sort}
                              alt=""
                              className="w-2.5 h-2.5"
                            />
                          ),
                          desc: (
                            <Image
                              src={column_sort}
                              alt=""
                              className="w-2.5 h-2.5"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? (
                          <Image
                            src={column_sort}
                            alt=""
                            className="w-2.5 h-2.5"
                          />
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
                    <Image
                      src={download}
                      alt=""
                      onClick={(e) =>
                        handleDownloadConversations(e, row.original)
                      }
                    />
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
        <ConversationElement
          conversation={selectedWorkflow}
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
