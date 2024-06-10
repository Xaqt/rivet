import x_icon from "@/assets/x_icon.svg";
import type React from "react";
import { type Workflow } from '../../api/types';
import { useWorkflows } from '../../hooks/useWorkflows';
import { formatDate } from '../../utils/time';

interface Props {
  setOpenModal: (isOpen: boolean) => void;
  workflow: Workflow | undefined;
}

export const DeleteWorkflow: React.FC<Props> = ({
  setOpenModal,
  workflow,
}) => {
  const { deleteWorkflow } = useWorkflows();
  const handleDelete = async () => {
    await deleteWorkflow(
      workflow?.id!,
    );
    setOpenModal(false);
  };

  return (
    <div className={"flex flex-col gap-4"}>
      <span className={"flex justify-between items-center"}>
        <span className={"text-xl"}>Delete Workflow</span>
        <img
          src={x_icon}
          alt={"x-icon"}
          width={13}
          height={13}
          onClick={() => setOpenModal(false)}
          className="object-cover object-center h-full w-[13px] cursor-pointer"
        />
      </span>
      <span className={"w-[325px] text-xs font-normal"}>
        Are you sure you want to delete the workflow with <br />{" "}
        <b>{workflow?.id}</b> <br />
        from <b>{formatDate(workflow?.created_at)}</b>
      </span>
      <span className={"w-[325px] text-xs font-normal"}>
        This Action cannot be undone and will delete the flow forever.
      </span>
      <span className={"flex justify-between gap-2"}>
        <button
          onClick={() => setOpenModal(false)}
          className="flex w-full border border-borderPrimary items-center self-center justify-center text-sm text-center text-black rounded-full h-7 hover:border-grayDark hover:bg-hoverPrimary"
        >
          <p className="text-xs">Cancel</p>
        </button>
        <button
          onClick={handleDelete}
          className="flex w-full items-center self-center justify-center text-sm text-center text-white bg-primary rounded-full h-7 bg-opacity-90 hover:bg-opacity-80"
        >
          <p className="text-xs">Delete Flow</p>
        </button>
      </span>
    </div>
  );
};
