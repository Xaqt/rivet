import { css } from '@emotion/react';
import type React from 'react';
import { useMemo, type FC, useState, Fragment } from 'react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { type ProjectId } from '@ironclad/rivet-core';
import { Box, Inline, xcss } from '@atlaskit/primitives';
import Select from '@atlaskit/select';
import TextField from '@atlaskit/textfield';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import LeftIcon from 'majesticons/line/chevron-left-line.svg?react';
import CloseIcon from 'majesticons/line/multiply-line.svg?react';
import BlankFileIcon from 'majesticons/line/file-line.svg?react';
import SettingsCogIcon from 'majesticons/line/settings-cog-line.svg?react';
import ExportIcon from '@atlaskit/icon/glyph/export';
import CopyIcon from '@atlaskit/icon/glyph/copy';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import PlusIcon from '@atlaskit/icon/glyph/add';
import EditIcon from '@atlaskit/icon/glyph/edit';

import {
  openedProjectsSortedIdsState,
  openedProjectsState,
  projectState,
  projectsState,
  savedGraphsState,
} from '../state/savedGraphs';
import clsx from 'clsx';
import { useLoadProject } from '../hooks/useLoadProject';
import { useSyncCurrentStateIntoOpenedProjects } from '../hooks/useSyncCurrentStateIntoOpenedProjects';
import { produce } from 'immer';
import { type SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { SortableContext, horizontalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { useLoadProjectWithFileBrowser } from '../hooks/useLoadProjectWithFileBrowser';
import { editProjectModalOpenState, newProjectModalOpenState } from '../state/ui';
import { keys } from '../../../core/src/utils/typeSafety';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import { useStableCallback } from '../hooks/useStableCallback';
import { IconButton } from '@atlaskit/button/new';
import { type MenuIds, useRunMenuCommand } from '../hooks/useMenuCommands';
import { sidebarOpenState } from '../state/graphBuilder';
import { Field } from '@atlaskit/form';
import { EditProjectModalRenderer } from './EditProjectModal';

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
    
    .project-inputs {
        margin-right: auto;
        gap: 5px;
        display: flex;
        align-items: center;
        padding-right: 10px;
        min-width: 320px;
    }
    
    .title-name {
        padding-left: 10px;
        font-size: 16px;
        color: var(--grey-light);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    span.title-name {
        flex: 1;
        min-width: 220px;
    }
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

export const ProjectSelector: FC = () => {
  const [project, setProject] = useRecoilState(projectState);
  const [savedGraphs, setSavedGraphs] = useRecoilState(savedGraphsState);
  const setProjects = useSetRecoilState(projectsState);
  const [openedProjects, setOpenedProjects] = useRecoilState(openedProjectsState);
  const [openedProjectsSortedIds, setOpenedProjectsSortedIds] = useRecoilState(openedProjectsSortedIdsState);
  const [title, setTitle] = useState(project?.metadata.title);
  const setEditProjectModalOpen = useSetRecoilState(editProjectModalOpenState);
  const runMenuCommandImpl = useRunMenuCommand();

  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const sidebarOpen = useRecoilValue(sidebarOpenState);

  const graphOptions = useMemo(
    () => [
      { label: '(None)', value: undefined },
      ...savedGraphs.map((g) => ({ label: g.metadata!.name, value: g.metadata!.id })),
    ],
    [savedGraphs],
  );

  const selectedMainGraph = graphOptions.find((g) => g.value === project.metadata.mainGraphId);

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
  };

  const openNewProjectModal = useStableCallback(() => setNewProjectModalOpen(true));

  function handleNewFlow(e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) {
    e.stopPropagation();
    openNewProjectModal();
  }

  function handleEditFlow(e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) {
    e.stopPropagation();
    setEditProjectModalOpen(true);
  }

  const ProjectDropdownMenu = () => {
    function getHandler(cmd: MenuIds) {
      const handler = (e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) => {
        runMenuCommand(cmd);
        e.preventDefault();
      };
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
          <DropdownItem elemBefore={<PlusIcon label="new"/>} onClick={handleNewFlow}>New Flow</DropdownItem>
          <DropdownItem elemBefore={<CopyIcon label="duplicate"/>}>Duplicate</DropdownItem>
          <DropdownItem>Import</DropdownItem>
          <DropdownItem elemBefore={<ExportIcon label="export"/>}>Export</DropdownItem>
          <DropdownItem elemBefore={<TrashIcon label="delete" />}>Delete</DropdownItem>
        </DropdownItemGroup>
      </DropdownMenu>
    );
  };

  return (
    <Fragment>
      <div css={styles}>
        <button>
          <LeftIcon />
        </button>
        <div className="project-inputs">
          <span className="title-name">{title}</span>
          <button onClick={handleEditFlow}>
            <EditIcon label="edit" />
          </button>
        </div>
        <div className="projects-container">
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
          <ProjectDropdownMenu/>
        </div>
      </div>
      <EditProjectModalRenderer />
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
