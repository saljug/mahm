import React from 'react';

interface DownloadButtonProps {
  downloadCount: string;
  onDownload: () => void;
  className?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ 
  downloadCount, 
  onDownload, 
  className = "" 
}) => {
  return (
    <button
      onClick={onDownload}
      className={`flex w-full h-full px-[70px] py-[19px] bg-[#171717] overflow-hidden rounded-[18px] justify-center items-center gap-[10px] hover:bg-[#171717]/80 transition-colors ${className}`}
      aria-label={`Download wallpaper (${downloadCount} downloads)`}
    >
      <div className="w-5 h-5 relative overflow-hidden">
        <div 
          className="absolute bg-white"
          style={{
            width: '7.91px',
            height: '12.08px',
            left: '6.05px',
            top: '1.88px'
          }}
        />
        <div 
          className="absolute bg-white"
          style={{
            width: '16.25px',
            height: '6.25px',
            left: '1.88px',
            top: '11.88px'
          }}
        />
      </div>
      <div 
        className="text-white text-center text-sm font-normal break-words"
        
      >
        Download ({downloadCount})
      </div>
    </button>
  );
};
