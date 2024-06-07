'use client';

import React, { Fragment, type ReactNode } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';

export type LayoutProps = {
  children: ReactNode;
  open: boolean;
  setOpen: () => void;
  width?: string;
};

export default function SidebarLayout({
  children,
  open,
  setOpen,
  width = '380px',
}: LayoutProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-49" onClose={setOpen}>
        <div
          onClick={setOpen}
          className="fixed inset-0 bg-gray-500 bg-opacity-75"
        />
        <TransitionChild
          as={Fragment}
          enter="transform transition-transform ease-in-out duration-500"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition-transform ease-in-out duration-500"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full">
          <DialogPanel
            style={{ width }}
            className="fixed inset-y-0 h-full right-0 bg-white">
            {children}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
