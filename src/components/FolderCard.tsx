import { FolderMetadata } from '@/types';
import { Folder, Trash } from 'lucide-react';

interface FolderCardProps {
  folder: FolderMetadata;
  onClick: () => void;
  onDelete: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onClick,
  onDelete,
}) => {
  return (
    <div
      className='group relative cursor-pointer rounded-lg bg-gray-800 p-4 shadow-md transition-all duration-200 hover:bg-gray-700'
      onClick={onClick}
    >
      <div className='flex items-center space-x-4'>
        <div className='rounded-lg bg-emerald-500 p-3'>
          <Folder className='h-6 w-6 text-white' />
        </div>
        <h3 className='text-lg font-semibold text-gray-100 group-hover:text-emerald-400'>
          {folder.name}
        </h3>
      </div>
      <button
        className='absolute right-2 top-2 rounded-md bg-gray-700 p-1 text-gray-400 opacity-0 transition-opacity duration-200 hover:text-red-500 group-hover:opacity-100'
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash className='h-4 w-4' />
      </button>
    </div>
  );
};
