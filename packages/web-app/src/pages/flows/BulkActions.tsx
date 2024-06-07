"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

const actions = [
  {
    name: "Tag",
    handler: () => {
      return "Tag";
    },
  },
];

export default function BulkActions({ handleBulkAction }: any) {
  const handleBulkSelect = async (handler: any, close: () => void) => {
    const action = handler();
    close();
    handleBulkAction(action);
  };

  // @ts-ignore
  return (
    <Popover className="z-40 flex">
      <PopoverButton
        as="div"
        className={({ open }) =>
          `flex items-center justify-center px-3 space-x-2 pl-4 py-0.5 m-auto text-xs rounded-full cursor-pointer h-7 ${
            open
              ? "bg-primary bg-opacity-10 border border-primary"
              : "bg-grayDefault border-gray-50"
          }`
        }
      >
        {({ open }) => (
          <>
            <div>Bulk Actions</div>
            {open ? (
              <ChevronUpIcon
                className="w-4 h-4 text-gray-600"
                aria-hidden="true"
              />
            ) : (
              <ChevronDownIcon
                className="w-4 h-4 text-gray-600"
                aria-hidden="true"
              />
            )}
          </>
        )}
      </PopoverButton>

      <PopoverPanel className="fixed z-10 flex w-48 px-4 mt-8 ">
        {({ close }) => (
          <div className="w-56 p-1 text-xs text-gray-900 bg-white shadow-lg shrink rounded-xl ring-1 ring-gray-900/5">
            {actions.map(({ handler, name }) => (
              <button
                key={name}
                className="flex w-full p-2 space-x-2 hover:bg-success hover:bg-opacity-10 hover:rounded"
                onClick={() => handleBulkSelect(handler, close)}
              >
                <div>{name}</div>
              </button>
            ))}
          </div>
        )}
      </PopoverPanel>
    </Popover>
  );
}
