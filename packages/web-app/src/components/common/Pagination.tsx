import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import React from "react";

interface Props {
  pageIndex: number;
  setPageIndex: (pageIndex: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  totalCount: number;
  disabled?: boolean;
}

export const Pagination: React.FC<Props> = ({
  pageIndex,
  pageSize,
  setPageIndex,
  setPageSize,
  totalCount,
  disabled = false
}) => {
  return (
    <div className="flex flex-row items-center justify-between px-2 mt-4 ">
      <div className="inline-flex -space-x-px rounded-md isolate">
        <button
          className="relative inline-flex items-center text-gray-400"
          onClick={() => setPageIndex(pageIndex - 1)}
          disabled={pageIndex <= 1 || disabled}
        >
          <ChevronLeftIcon
            className="w-5 h-5 text-gray-600"
            aria-hidden="true"
          />
        </button>

        {pageIndex > 4 && (
          <React.Fragment>
            <button
              className="relative z-10 inline-flex items-center px-4 py-2 text-xs font-semibold text-gray-600 hover:text-black"
              onClick={() => setPageIndex(1)}
              disabled={disabled}
            >
              1
            </button>
            <div className="relative z-10 inline-flex items-center px-4 py-2 text-xs font-semibold text-gray-600">
              ...
            </div>
          </React.Fragment>
        )}

        {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => {
          if (i >= pageIndex - 4 && i <= pageIndex + 2) {
            return (
              <button
                key={`page-${i}`}
                className={`relative z-10 inline-flex items-center px-4 py-2 text-xs font-semibold text-gray-600 hover:text-black ${
                  pageIndex === i + 1 ? "text-primary" : ""
                }`}
                onClick={() => setPageIndex(i + 1)}
                disabled={disabled}
              >
                {i + 1}
              </button>
            );
          }
        })}

        {pageIndex < Math.ceil(totalCount / pageSize) - 3 && (
          <React.Fragment>
            <div className="relative z-10 inline-flex items-center px-4 py-2 text-xs font-semibold text-gray-600">
              ...
            </div>
            <button
              className="relative z-10 inline-flex items-center px-4 py-2 text-xs font-semibold text-gray-600 hover:text-black"
              onClick={() => setPageIndex(Math.ceil(totalCount / pageSize))}
              disabled={disabled}
            >
              {Math.ceil(totalCount / pageSize)}
            </button>
          </React.Fragment>
        )}

        <button
          className="relative inline-flex items-center px-2 py-2 text-gray-400"
          onClick={() => setPageIndex(pageIndex + 1)}
          disabled={pageIndex >= Math.ceil(totalCount / pageSize) || disabled}
        >
          <ChevronRightIcon
            className="w-5 h-5 text-gray-600"
            aria-hidden="true"
          />
        </button>
      </div>
      <div className="flex">
        <select
          className="py-1 text-xs text-gray-500 bg-gray-200 border-0 rounded-full w-28 h-7"
          value={pageSize}
          disabled={disabled}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPageIndex(
              pageIndex >= Math.ceil(totalCount / Number(e.target.value))
                ? Math.ceil(totalCount / Number(e.target.value))
                : pageIndex,
            );
          }}
        >
          {[5, 10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
