import { FolderMetadata } from "@/types";
import { Folder, Trash } from "lucide-react";

interface FolderCardProps {
  folder: FolderMetadata;
  onClick: () => void;
  onDelete: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, onClick, onDelete }) => {
  return (
    <div 
      className="relative p-4 bg-gray-800 rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:bg-gray-700 group"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-emerald-500 rounded-lg">
          <Folder className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-100 group-hover:text-emerald-400">
          {folder.name}
        </h3>
      </div>
      <button
        className="absolute top-2 right-2 p-1 bg-gray-700 rounded-md text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash className="h-4 w-4" />
      </button>
    </div>
  );
};