import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTagSelect?: (tag: string) => void;
  wallpaper: {
    id: string;
    name: string;
    tags: string[];
    imageUrl: string;
    downloadUrl: string;
    isHot: boolean;
    downloadCount: string;
  };
}

export const ImageModal: React.FC<ImageModalProps> = ({ 
  isOpen, 
  onClose, 
  onTagSelect,
  wallpaper 
}) => {
  const handleDownload = async () => {
    try {
      // Fetch the image as a blob to handle CORS properly
      const response = await fetch(wallpaper.downloadUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${wallpaper.name.replace(/\s+/g, '_')}_wallpaper.jpg`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: try direct link download
      try {
        const link = document.createElement('a');
        link.href = wallpaper.downloadUrl;
        link.download = `${wallpaper.name.replace(/\s+/g, '_')}_wallpaper.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
      }
    }
  };

  const handleTagClick = (tag: string) => {
    if (onTagSelect) {
      onTagSelect(tag);
      onClose(); // Close modal after selecting tag
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            {/* Backdrop */}
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Dialog.Overlay>
            
            {/* Modal Content */}
            <Dialog.Content asChild>
              <motion.div
                className="fixed inset-4 z-50 lg:inset-8 xl:inset-16"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {/* Close Button - Always in top right */}
                <div className="absolute top-3 right-3 z-20 md:top-4 md:right-4 lg:top-6 lg:right-6">
                  <Dialog.Close asChild>
                    <button className="w-12 h-12 bg-black/70 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg group focus:outline-none focus:ring-2 focus:ring-white/80">
                      <Icon icon="mdi:close" width={28} height={28} className="text-white" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Hot Badge - Always in top left */}
                {wallpaper.isHot && (
                  <div className="absolute top-6 left-6 z-20">
                    <div className="bg-[#C8102E] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                      <Icon icon="solar:fire-bold" width={14} height={14} className="text-white" />
                      <span 
                        className="text-white text-sm font-medium"
                        style={{ fontFamily: 'Britti Sans Trial' }}
                      >
                        Hot
                      </span>
                    </div>
                  </div>
                )}

                {/* Desktop Design (lg and up) */}
                <div className="hidden lg:block w-full h-full p-6 bg-[#0A0A0A] overflow-hidden rounded-[18px]">
                  <div className="flex justify-start items-center gap-8 h-full">
                    {/* Image Container */}
                    <div className="w-[632px] h-[632px] relative bg-[#171717] rounded-lg overflow-hidden flex items-center justify-center">
                      {wallpaper.imageUrl ? (
                        <img
                          src={wallpaper.imageUrl}
                          alt={wallpaper.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <Icon icon="solar:gallery-minimalistic-linear" width={80} height={80} className="text-white/60" />
                      )}
                    </div>

                    {/* Content Panel */}
                    <div className="w-[396px] h-[593px] flex flex-col justify-between items-start">
                      {/* Top Content */}
                      <div className="w-[260px] flex flex-col justify-start items-start gap-8">
                        {/* Title */}
                        <Dialog.Title asChild>
                          <h2 
                            className="w-full text-white text-[48px] font-normal break-words leading-tight"
                            style={{ fontFamily: 'Britti Sans Trial' }}
                          >
                            {wallpaper.name}
                          </h2>
                        </Dialog.Title>

                        {/* Tags */}
                        <div className="w-full flex justify-start items-center gap-3 flex-wrap">
                          {wallpaper.tags.map((tag, index) => (
                            <button
                              key={index}
                              onClick={() => handleTagClick(tag)}
                              className="px-6 py-3 bg-[#171717] rounded-[30px] hover:bg-[#333] transition-all duration-200 hover:scale-105 shadow-sm"
                              title={`Filter by ${tag}`}
                            >
                              <div 
                                className="text-white text-[18px] font-medium"
                                style={{ fontFamily: 'Britti Sans Trial' }}
                              >
                                {tag}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Download Button */}
                      <button
                        onClick={handleDownload}
                        className="w-full h-[52px] px-8 py-3 bg-[#171717] hover:bg-[#333] hover:scale-105 rounded-[20px] flex justify-center items-center gap-3 transition-all duration-200 shadow-lg border border-[#333] hover:border-[#555]"
                      >
                        <Icon 
                          icon="solar:download-minimalistic-bold" 
                          width={20} 
                          height={20} 
                          className="text-white"
                        />
                        <div 
                          className="text-white text-center text-base font-medium"
                          style={{ fontFamily: 'Britti Sans Trial' }}
                        >
                          Download ({wallpaper.downloadCount})
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tablet Design (md to lg) */}
                <div className="hidden md:block lg:hidden w-full h-full p-6 bg-[#0A0A0A] overflow-hidden rounded-[22px]">
                  <div className="flex justify-start items-center gap-8 h-full">
                    {/* Image Container */}
                    <div className="w-[450px] h-[450px] relative bg-[#171717] rounded-lg overflow-hidden flex items-center justify-center">
                      {wallpaper.imageUrl ? (
                        <img
                          src={wallpaper.imageUrl}
                          alt={wallpaper.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <Icon icon="solar:gallery-minimalistic-linear" width={60} height={60} className="text-white/60" />
                      )}
                    </div>

                    {/* Content Panel */}
                    <div className="flex-1 h-full flex flex-col justify-between items-start">
                      {/* Top Content */}
                      <div className="flex flex-col justify-start items-start gap-6">
                        {/* Title */}
                        <Dialog.Title asChild>
                          <h2 
                            className="text-white text-3xl font-normal break-words leading-tight"
                            style={{ fontFamily: 'Britti Sans Trial' }}
                          >
                            {wallpaper.name}
                          </h2>
                        </Dialog.Title>

                        {/* Tags */}
                        <div className="flex justify-start items-center gap-3 flex-wrap">
                          {wallpaper.tags.map((tag, index) => (
                            <button
                              key={index}
                              onClick={() => handleTagClick(tag)}
                              className="px-4 py-2.5 bg-[#171717] rounded-[20px] hover:bg-[#333] transition-all duration-200 hover:scale-105 shadow-sm"
                              title={`Filter by ${tag}`}
                            >
                              <div 
                                className="text-white text-sm font-medium"
                                style={{ fontFamily: 'Britti Sans Trial' }}
                              >
                                {tag}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Download Button */}
                      <button
                        onClick={handleDownload}
                        className="w-full h-14 px-6 py-3 bg-[#171717] hover:bg-[#333] hover:scale-105 rounded-[18px] flex justify-center items-center gap-2.5 transition-all duration-200 shadow-lg border border-[#333] hover:border-[#555]"
                      >
                        <Icon 
                          icon="solar:download-minimalistic-bold" 
                          width={18} 
                          height={18} 
                          className="text-white"
                        />
                        <div 
                          className="text-white text-center text-sm font-medium"
                          style={{ fontFamily: 'Britti Sans Trial' }}
                        >
                          Download ({wallpaper.downloadCount})
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Design */}
                <div className="block md:hidden w-full h-full p-5 bg-[#0A0A0A] overflow-hidden rounded-[22px]">
                  <div className="flex flex-col justify-start items-start gap-7 h-full">
                    {/* Image Container */}
                    <div className="w-full aspect-square relative bg-[#171717] rounded-xl overflow-hidden flex items-center justify-center">
                      {wallpaper.imageUrl ? (
                        <img
                          src={wallpaper.imageUrl}
                          alt={wallpaper.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <Icon icon="solar:gallery-minimalistic-linear" width={60} height={60} className="text-white/60" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between w-full">
                      {/* Top Content */}
                      <div className="flex flex-col gap-4">
                        {/* Title */}
                        <Dialog.Title asChild>
                          <h2 
                            className="text-white text-2xl font-normal break-words leading-tight mt-2 mb-1"
                            style={{ fontFamily: 'Britti Sans Trial' }}
                          >
                            {wallpaper.name}
                          </h2>
                        </Dialog.Title>

                        {/* Tags */}
                        <div className="flex justify-start items-center gap-2 flex-wrap mb-2">
                          {wallpaper.tags.map((tag, index) => (
                            <button
                              key={index}
                              onClick={() => handleTagClick(tag)}
                              className="px-3 py-2 bg-[#171717] rounded-[15px] hover:bg-[#333] transition-all duration-200 hover:scale-105 shadow-sm mt-1"
                              title={`Filter by ${tag}`}
                            >
                              <div 
                                className="text-white text-sm font-medium"
                                style={{ fontFamily: 'Britti Sans Trial' }}
                              >
                                {tag}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Download Button */}
                      <button
                        onClick={handleDownload}
                        className="w-full h-12 px-4 py-3 bg-[#171717] hover:bg-[#333] hover:scale-105 rounded-[18px] flex justify-center items-center gap-2 transition-all duration-200 shadow-lg border border-[#333] hover:border-[#555] mt-3"
                      >
                        <Icon 
                          icon="solar:download-minimalistic-bold" 
                          width={18} 
                          height={18} 
                          className="text-white"
                        />
                        <div 
                          className="text-white text-center text-sm font-medium"
                          style={{ fontFamily: 'Britti Sans Trial' }}
                        >
                          Download ({wallpaper.downloadCount})
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}; 