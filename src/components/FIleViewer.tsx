import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { PDFViewer } from './PdfViewer';
import { FileViewerProps, SupportedMimeTypes } from '@/types';

export const FileViewer: React.FC<FileViewerProps> = ({
  fileUrl,
  fileName,
  mimeType,
  onClose
}) => {
  const renderContent = () => {
    switch (mimeType as SupportedMimeTypes) {
      case 'application/pdf':
        return <PDFViewer fileUrl={fileUrl} fileName={fileName} />;
      case 'image/png':
      case 'image/jpeg':
      case 'image/gif':
        return (
          <div className="h-full w-full flex items-center justify-center">
            <img 
              src={fileUrl} 
              alt={fileName || 'Preview'} 
              className="max-h-full max-w-full object-contain"
            />
          </div>
        );
      default:
        return (
          <div className="text-center p-4">
            Unsupported file type: {mimeType}
          </div>
        );
    }
  };

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50"
        onClose={() => onClose?.()}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl h-[80vh] transform overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all">
                <div className="h-full">
                  {renderContent()}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};