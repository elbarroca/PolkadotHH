'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FileText, Download, ExternalLink, Trash, Share2 } from 'lucide-react';
import { FilePreview } from './FilePreview';
import { ShareModal } from './ShareModal';

interface FileCardProps {
  id: string;
  title: string;
  imageUrl: string;
  size: string;
  uploadedBy?: string;
  description?: string;
  onDelete: (id: string) => void;
}

const DEFAULT_IMAGE = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.MNqiZl7u5qQXf8ZHngXwdgHaE8%26pid%3DApi&f=1&ipt=51653442534b74a6b21852af102f8cb0723453af3425edfb09fc6fc0aa7caa63&ipo=images";

export const FileCard: React.FC<FileCardProps> = ({
  id,
  title,
  imageUrl = DEFAULT_IMAGE,
  size,
  uploadedBy,
  description,
  onDelete
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleShare = (recipientAddress: string) => {
    console.log(`Sharing ${title} with ${recipientAddress}`);
    // Implement your sharing logic here
  };

  return (
    <>
      <div
        className="group relative bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer backdrop-blur-sm transform hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsPreviewOpen(true)}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        {/* Image Container */}
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          
          {/* Hover Actions */}
          <div className={`absolute inset-0 flex items-center justify-center gap-6 bg-gray-900/70 backdrop-blur-sm transition-all duration-300 z-20 
            ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          >
            <button 
              className="p-4 bg-emerald-500/90 rounded-full hover:bg-emerald-500 transform hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-emerald-500/50"
              onClick={(e) => {
                e.stopPropagation();
                // Handle download
                console.log('Downloading:', title);
              }}
            >
              <Download className="h-6 w-6 text-white" />
            </button>
            <button 
              className="p-4 bg-emerald-500/90 rounded-full hover:bg-emerald-500 transform hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-emerald-500/50"
              onClick={(e) => {
                e.stopPropagation();
                setIsShareModalOpen(true);
              }}
            >
              <Share2 className="h-6 w-6 text-white" />
            </button>
            {onDelete && (
              <button 
                className="p-4 bg-red-500/90 rounded-full hover:bg-red-500 transform hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-red-500/50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
              >
                <Trash className="h-6 w-6 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <FileText className="h-5 w-5 text-emerald-400 group-hover:text-emerald-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-200 truncate group-hover:text-emerald-400 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-gray-400 truncate mt-1">
                {description?.substring(0, 50)}...
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-gray-400">
                {uploadedBy ? `${uploadedBy.slice(0, 6)}...${uploadedBy.slice(-4)}` : 'Anonymous'}
              </span>
            </div>
            {size && (
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">
                {size}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-700/50">
          <div className="h-full bg-emerald-500 transition-all duration-500 w-full transform origin-left scale-x-0 group-hover:scale-x-100" />
        </div>
      </div>

      <FilePreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={{
          title,
          imageUrl,
          size: size || 'Unknown',
          uploadedBy,
          description
        }}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        fileTitle={title}
        onShare={handleShare}
      />
    </>
  );
};