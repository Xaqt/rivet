"use client";

import { Fragment, type ReactNode } from "react";
import { Dialog, DialogPanel } from '@headlessui/react';

export type LayoutProps = {
  children: ReactNode;
  open: boolean;
  setOpen: () => void;
  height?: string;
  width?: string;
};

export default function ModalLayout({
  children,
  open,
  setOpen,
  height,
  width,
}: LayoutProps) {
  // @ts-ignore
  return (
    <Dialog as="div" className="relative " onClose={setOpen}>
      <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            className={`relative px-4 pt-5 pb-4 overflow-visible text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8  ${
              width ? width : "sm:max-w-sm sm:w-full"
            } sm:p-6`}
            style={{ height }}
          >
            {children}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
