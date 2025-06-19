import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export function Dialog({ isOpen, onClose, title, children }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <HeadlessDialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <HeadlessDialog.Panel className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg">
            <HeadlessDialog.Title className="text-lg font-semibold">
              {title}
            </HeadlessDialog.Title>
            <div className="mt-2">{children}</div>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </HeadlessDialog.Panel>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}
