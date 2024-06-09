import { css } from '@emotion/react';
import React, { useMemo, type FC, useState, Fragment } from 'react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { type ProjectId } from '@ironclad/rivet-core';
import ButtonGroup from '@atlaskit/button/button-group';
import Button from '@atlaskit/button/new';
import { Box, Inline, xcss } from '@atlaskit/primitives';
import Select from '@atlaskit/select';
import TextField from '@atlaskit/textfield';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import LeftIcon from 'majesticons/line/chevron-left-line.svg?react';
import CloseIcon from 'majesticons/line/multiply-line.svg?react';
import BlankFileIcon from 'majesticons/line/file-line.svg?react';
import FileIcon from 'majesticons/line/file-plus-line.svg?react';
import FolderIcon from 'majesticons/line/folder-line.svg?react';
import DeleteIcon from 'majesticons/line/delete-bin-line.svg?react';
import SettingsCogIcon from 'majesticons/line/settings-cog-line.svg?react';
import DuplicateIcon from 'majesticons/line/image-multiple-line.svg?react';
import EditorMoreIcon from '@atlaskit/icon/glyph/editor/more'
import { openedProjectsSortedIdsState, openedProjectsState, projectState, projectsState } from '../state/savedGraphs';
import clsx from 'clsx';
import { useLoadProject } from '../hooks/useLoadProject';
import { useSyncCurrentStateIntoOpenedProjects } from '../hooks/useSyncCurrentStateIntoOpenedProjects';
import { produce } from 'immer';
import { type SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { SortableContext, horizontalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { useLoadProjectWithFileBrowser } from '../hooks/useLoadProjectWithFileBrowser';
import { newProjectModalOpenState } from '../state/ui';
import { keys } from '../../../core/src/utils/typeSafety';
import { InlineEditableTextfield } from '@atlaskit/inline-edit';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import { useStableCallback } from '../hooks/useStableCallback';
import { IconButton } from '@atlaskit/button/new';
import { MenuIds, useRunMenuCommand } from '../hooks/useMenuCommands';
import { sidebarOpenState } from '../state/graphBuilder';
import PageHeader from '@atlaskit/page-header';


export const styles = css`
    position: absolute;

    left: 0;
    top: 0;
    right: 0;
    height: var(--project-selector-height);
    z-index: 101;

    background: var(--grey-darkerish);
    border-bottom: 1px solid var(--grey);

    display: flex;
    justify-content: space-between;

    .projects-container {
        display: flex;
        flex: 1;
        width: 100%;
        overflow: hidden;
    }

    .projects {
        display: flex;
        align-items: stretch;
        height: 100%;
        gap: 1px;
        padding-right: 1px;
        width: 100%;
    }

    > .actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-right: 8px;

        button {
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            margin: 0;
            border-radius: 5px;
            background: transparent;
            padding: 8px;
            width: 32px;
            height: 32px;
            justify-content: center;

            &:hover {
                background-color: rgba(255, 255, 255, 0.2);
            }

            svg {
                width: 16px;
                height: 16px;
            }
        }

    }

    .draggableProject {
        display: flex;
        min-width: 50px;
        flex-shrink: 1;
    }

    .project {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 6px 0 12px;
        cursor: pointer;
        user-select: none;
        gap: 8px;
        font-size: 12px;
        height: calc(100% + 1px);
        margin-bottom: -1px;
        background: var(--grey-darkerish);
        border-bottom: 1px solid var(--grey);
        flex-shrink: 1;
        min-width: 50px;
        position: relative;

        svg {
            width: 12px;
            height: 12px;
        }

        .project-name {
            display: flex;
            align-items: center;
            align-self: stretch;
            overflow: hidden;
            gap: 8px;
            min-width: 50px;
            flex-shrink: 1;
            white-space: nowrap;
            text-overflow: ellipsis;

            > span {
                min-width: 50px;
                flex-shrink: 1;
            }
        }

        &:hover {
            background-color: var(--grey-darkish);
            border-bottom: 1px solid var(--grey);
        }

        &.active {
            background-color: var(--grey-darkish);
            border-bottom: 1px solid var(--primary);
        }

        &.unsaved {
            font-style: italic;
        }

        > .actions {
            display: flex;
            align-items: center;
            gap: 8px;
            visibility: hidden;
        }

        &:hover .actions {
            visibility: visible;
        }

        .close-project {
            background: transparent;
            border: none;
            padding: 0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--grey-light);
            width: 20px;
            height: 20px;
            border-radius: 4px;

            svg {
                width: 12px;
                height: 12px;
            }

            &:hover {
                color: var(--grey-lightest);
                background-color: var(--grey);
            }
        }
    }

    .project::after {
        content: '';
        display: block;
        position: absolute;
        right: -1px;
        width: 1px;
        background-color: var(--grey-darkest);
        height: 100%;
    }
`;

const selectContainerStyles = xcss({
  flex: '0 0 200px',
  marginInlineStart: 'space.100',
});

const flexBoxStyles = xcss({
  flex: '0 0 200px',
});

const barContent = (
  <Inline>
    <Box xcss={flexBoxStyles}>
      <TextField isCompact placeholder="Filter" aria-label="Filter" />
    </Box>
    <Box xcss={selectContainerStyles}>
      <Select
        spacing="compact"
        placeholder="Choose an option"
        aria-label="Choose an option"
      />
    </Box>
  </Inline>
);


export const ProjectSelector: FC = () => {
  const [project, setProject] = useRecoilState(projectState);
  const setProjects = useSetRecoilState(projectsState);
  const [openedProjects, setOpenedProjects] = useRecoilState(openedProjectsState);
  const [openedProjectsSortedIds, setOpenedProjectsSortedIds] = useRecoilState(openedProjectsSortedIdsState);
  const [title, setTitle] = useState(project?.metadata.title);
  const runMenuCommandImpl = useRunMenuCommand();

  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const sidebarOpen = useRecoilValue(sidebarOpenState);

  const runMenuCommand: typeof runMenuCommandImpl = (command) => {
    setFileMenuOpen(false);
    runMenuCommandImpl(command);
  };

  const sortedOpenedProjects = useMemo(() => {
    return openedProjectsSortedIds
      .map((projectId) => ({
        id: projectId,
        project: openedProjects[projectId]!,
      }))
      .filter((item) => item.project != null);
  }, [openedProjectsSortedIds, openedProjects]);

  const loadProject = useLoadProject();

  const setNewProjectModalOpen = useSetRecoilState(newProjectModalOpenState);
  const loadProjectWithFileBrowser = useLoadProjectWithFileBrowser();

  useSyncCurrentStateIntoOpenedProjects();

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      setOpenedProjectsSortedIds((openedProjectsSortedIds) => {
        const oldIndex = openedProjectsSortedIds.indexOf(active?.id as ProjectId);
        const newIndex = openedProjectsSortedIds.indexOf(over?.id as ProjectId);
        return arrayMove(openedProjectsSortedIds, oldIndex, newIndex);
      });
    }
  };

  const handleCloseProject = (projectId: ProjectId) => {
    const indexOfProject = openedProjectsSortedIds.indexOf(projectId);
    if (indexOfProject === -1) {
      return;
    }

    setProjects((projects) =>
      produce(projects, (draft) => {
        delete draft.openedProjects[projectId];
        draft.openedProjectsSortedIds = draft.openedProjectsSortedIds.filter(
          (id) => id !== projectId && draft.openedProjects[id] != null,
        );

        for (const projectId of keys(draft.openedProjects)) {
          if (draft.openedProjectsSortedIds.includes(projectId) === false) {
            delete draft.openedProjects[projectId];
          }
        }
      }),
    );

    const closestProject = sortedOpenedProjects[indexOfProject + 1] || sortedOpenedProjects[indexOfProject - 1];
    if (closestProject) {
      loadProject(closestProject.project);
    } else {
      setNewProjectModalOpen(true);
    }
  };

  const handleSelectProject = (projectId: ProjectId) => {
    const projectInfo = openedProjects[projectId];
    if (projectInfo) {
      loadProject(projectInfo);
    }
  };

  const validateName = (value: string) => {
    if (value?.length <= 6) {
      return 'Please enter a name longer than 6 characters';
    }
    return undefined;
  };

  const handleNameChange = (newTitle: string) => {
    // setProject({ ...project, metadata: { ...project.metadata, title: newValue } })}
    setTitle(newTitle);
  }

  const openNewProjectModal = useStableCallback(() => setNewProjectModalOpen(true));

  function handleNewProject(e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) {
    e.stopPropagation();
    openNewProjectModal();
  }

  const ProjectDropdownMenu = () => {
    function getHandler(cmd: MenuIds) {
      const handler = (e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) => {
        runMenuCommand(cmd);
        e.preventDefault();
      }
      return handler;
    }

    return (
      <DropdownMenu<HTMLButtonElement>
        trigger={({ triggerRef, ...props }) => (
          <button {...props} ref={triggerRef}>
            <SettingsCogIcon />
          </button>
        )}
        shouldFlip={true}
        shouldRenderToParent>
        <DropdownItemGroup>
          <DropdownItem elemBefore={<FileIcon/>} onClick={handleNewProject}>New Project</DropdownItem>
          <DropdownItem>Share</DropdownItem>
          <DropdownItem elemBefore={<DuplicateIcon/>}>Duplicate</DropdownItem>
          <DropdownItem>Import</DropdownItem>
          <DropdownItem>Export</DropdownItem>
          <DropdownItem elemBefore={<DeleteIcon />}>Delete</DropdownItem>
          <DropdownItem>Report</DropdownItem>
        </DropdownItemGroup>
      </DropdownMenu>
    );
  };

  const actionsContent = (
    <ButtonGroup label="Content actions">
      <Button appearance="primary">Edit page</Button>
      <Button>Share</Button>
      <ProjectDropdownMenu />
    </ButtonGroup>
  );

  const FlowPageHeader = () => {
    return (
      <PageHeader actions={actionsContent}>
        <button>
          <LeftIcon />
        </button>

        <InlineEditableTextfield
          key="inline-project-edit"
          placeholder="Flow Name"
          readViewFitContainerWidth
          defaultValue={title}
          validate={validateName}
          onConfirm={handleNameChange}
        />
      </PageHeader>
    );
  };

  return (
    <Fragment>
      <FlowPageHeader />
      <div css={styles}>
        <div className="projects-container">
          <button>
            <LeftIcon />
          </button>
          <div className="projects">
            <DndContext onDragEnd={handleDragEnd}>
              <SortableContext items={sortedOpenedProjects} strategy={horizontalListSortingStrategy}>
                {sortedOpenedProjects.map((project) => {
                  return (
                    <SortableProject
                      key={project.id}
                      projectId={project.project.project.metadata.id}
                      onCloseProject={() => handleCloseProject(project.project.project.metadata.id)}
                      onSelectProject={() => handleSelectProject(project.project.project.metadata.id)}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export const SortableProject: FC<{
  projectId: ProjectId;
  onCloseProject?: () => void;
  onSelectProject?: () => void;
}> = ({ ...props }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging, transition } = useSortable({
    id: props.projectId,
  });

  return (
    <div
      className="draggableProject"
      ref={setNodeRef}
      style={{
        transform: `translate3d(${transform ? transform.x : 0}px, ${transform ? transform.y : 0}px, 0)`,
        transition,
      }}
      {...attributes}
    >
      <ProjectTab {...props} dragListeners={listeners} isDragging={isDragging} />
    </div>
  );
};

export const ProjectTab: FC<{
  projectId: ProjectId;
  isDragging: boolean;
  dragListeners?: SyntheticListenerMap;
  onCloseProject?: () => void;
  onSelectProject?: () => void;
}> = ({ projectId, dragListeners, onCloseProject, onSelectProject }) => {
  const openedProjects = useRecoilValue(openedProjectsState);
  const currentProject = useRecoilValue(projectState);

  const project = openedProjects[projectId];

  const unsaved = !project?.fsPath;
  const fileName = unsaved ? 'Unsaved' : project.fsPath!.split('/').pop();
  const projectDisplayName = `${project?.project.metadata.title}${fileName ? ` [${fileName}]` : ''}`;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) {
      onSelectProject?.();
    }
  };

  const closeProject = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onCloseProject?.();
  };

  return (
    <div
      className={clsx('project', { active: currentProject.metadata.id === projectId, unsaved })}
      onMouseDown={handleMouseDown}
    >
      <BlankFileIcon />
      <div className="project-name" {...dragListeners}>
        <span>{projectDisplayName}</span>
      </div>
      <div className="actions">
        <button className="close-project" onMouseDown={(e) => e.stopPropagation()} onClick={closeProject}>
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};
