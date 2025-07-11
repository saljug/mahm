import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

interface WallpaperCardProps {
  id: string;
  name: string;
  tags: string[];
  imageUrl?: string;
  downloadUrl: string;
  isHot?: boolean;
  downloadCount: string;
  alt?: string;
  aspectRatio?: 'mobile' | 'desktop' | 'profile';
  index?: number; // For numbered download button IDs
  onTagSelect?: (tag: string) => void;
}

export const WallpaperCard: React.FC<WallpaperCardProps> = ({ 
  id, 
  name,
  tags,
  imageUrl, 
  downloadUrl,
  isHot = false, 
  downloadCount,
  alt = "Wallpaper",
  aspectRatio = "mobile",
  index = 0,
  onTagSelect
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      // Fetch the image as a blob to handle CORS properly
      const response = await fetch(downloadUrl, {
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
      link.download = `${name.replace(/\s+/g, '_')}_wallpaper.jpg`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      
      console.log(`Downloaded wallpaper: ${name}`);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: try direct link download
      try {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${name.replace(/\s+/g, '_')}_wallpaper.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
        // Last resort: open in new tab
        window.open(downloadUrl, '_blank');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get responsive dimensions based on aspect ratio
  const getCardStyles = () => {
    switch (aspectRatio) {
      case 'mobile':
        return {
          container: 'w-full aspect-[9/19.5] max-w-[250px]',
          hotBadge: 'absolute top-2.5 left-2.5'
        };
      case 'desktop':
        return {
          container: 'w-full aspect-video',
          hotBadge: 'absolute top-2.5 left-2.5'
        };
      case 'profile':
        return {
          container: 'w-full aspect-square max-w-[250px]',
          hotBadge: 'absolute top-2.5 left-2.5'
        };
      default:
        return {
          container: 'w-full aspect-[9/19.5] max-w-[250px]',
          hotBadge: 'absolute top-2.5 left-2.5'
        };
    }
  };

  const styles = getCardStyles();

  // Generate numbered download button ID
  const downloadButtonId = `ICON_DOWNLOAD_${index + 1}`;

  return (
    <div className="w-full group">
      <motion.article 
        className={`${styles.container} relative bg-gradient-to-b from-[#171717] to-[#7D7D7D] overflow-hidden rounded-[18px]`}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
        layout
      >
        {/* Background Image or Gradient */}
        {imageUrl ? (
          <motion.img 
            src={imageUrl} 
            alt={alt}
            className="w-full h-full object-cover"
            loading="lazy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#171717] to-[#7D7D7D]" />
        )}
        
        {/* Hot Badge - Top Left */}
        {isHot && (
          <motion.div 
            className={styles.hotBadge}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-5 px-1.5 py-0 bg-[#C8102E] overflow-hidden rounded-[32px] justify-center items-center gap-0.5 inline-flex">
              <Icon 
                icon="solar:fire-bold" 
                width={12} 
                height={12} 
                className="text-white"
              />
              <div className="text-white text-center text-[11px] font-normal font-geist">
                Hot
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Desktop Download Button - Inside frame, bottom overlay, hover only */}
        <div className="hidden md:block absolute bottom-1.5 left-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            id={downloadButtonId}
            onClick={handleDownload}
            disabled={isLoading}
            className="w-full h-[46px] flex items-center justify-center gap-2 bg-[#171717]/90 hover:bg-[#171717] text-white px-4 rounded-[12px] transition-colors backdrop-blur-sm"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Icon 
                icon="solar:download-minimalistic-bold" 
                width={16} 
                height={16} 
                className="text-white"
              />
            )}
            <span className="text-sm font-medium font-geist">
              {isLoading ? 'Downloading...' : `Download (${downloadCount})`}
            </span>
          </button>
        </div>
        
        {/* Loading Overlay */}
        {isLoading && (
          <motion.div 
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </motion.div>
        )}
      </motion.article>
      
      {/* Mobile/Tablet Download Button - Below image, always visible */}
      <div className="block md:hidden mt-3">
        <button
          id={downloadButtonId}
          onClick={handleDownload}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#171717] hover:bg-[#171717]/90 text-white px-4 py-3 rounded-lg transition-colors"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Icon 
              icon="solar:download-minimalistic-bold" 
              width={16} 
              height={16} 
              className="text-white"
            />
          )}
          <span className="text-sm font-medium font-geist">
            {isLoading ? 'Downloading...' : `Download (${downloadCount})`}
          </span>
        </button>
      </div>
    </div>
  );
};
