import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { MobileNavbar } from '@/components/MobileNavbar';
import { RadioFilter } from '@/components/RadioFilter';
import { TagFilter } from '@/components/TagFilter';
import { WallpaperCard } from '@/components/WallpaperCard';
import { useWallpapers } from '@/hooks/useWallpapers';

const Index = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('wallpapers');
  const [selectedFilter, setSelectedFilter] = useState<'mobile' | 'desktop' | 'profile'>('mobile');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { wallpapers, allWallpapers, availableTags, isLoading, error, refetch } = useWallpapers({ 
    type: selectedFilter,
    selectedTags 
  });

  // Check if we're showing cross-type results
  const isShowingCrossTypeResults = selectedTags.length > 0 && wallpapers.length > 0 && 
    wallpapers.some(w => w.type !== selectedFilter);

  const filterOptions = [
    { id: 'mobile', label: 'Mobile', value: 'mobile', icon: 'solar:smartphone-linear' },
    { id: 'desktop', label: 'Desktop', value: 'desktop', icon: 'solar:monitor-outline' },
    { id: 'profile', label: 'PP', value: 'profile', icon: 'solar:user-circle-linear' }
  ];

  // Responsive grid classes based on wallpaper type
  const getGridClasses = () => {
    const baseClasses = "gap-6 w-full";
    
    switch (selectedFilter) {
      case 'mobile':
        return `${baseClasses} grid 
          grid-cols-2 sm:grid-cols-3 
          md:grid-cols-4 lg:grid-cols-5 
          xl:grid-cols-6 2xl:grid-cols-6`;
      case 'desktop':
        return `${baseClasses} grid 
          grid-cols-1 sm:grid-cols-2 
          md:grid-cols-2 lg:grid-cols-3 
          xl:grid-cols-3 2xl:grid-cols-3`;
      case 'profile':
        return `${baseClasses} grid 
          grid-cols-2 sm:grid-cols-3 
          md:grid-cols-4 lg:grid-cols-5 
          xl:grid-cols-6 2xl:grid-cols-6`;
      default:
        return `${baseClasses} grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6`;
    }
  };

  const handleMenuItemClick = (item: string) => {
    setActiveMenuItem(item);
  };

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value as 'mobile' | 'desktop' | 'profile');
    // Keep selected tags when changing type filter for global filtering
  };

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  const handleTagSelect = (tag: string) => {
    // Add the selected tag if not already selected
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };



  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] overflow-hidden">
      <Sidebar 
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
      />
      
      <MobileNavbar 
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
      />
      
      {/* Main content with responsive margins and mobile bottom padding */}
      <main className="md:ml-[270px] flex-1 px-5 pt-8 pb-8 md:pb-8 pb-24 overflow-hidden flex-col justify-start items-start gap-[52px] flex">
        <div className="w-full flex-col justify-start items-start gap-6 flex">
          {/* Header */}
          <header className="w-full justify-start items-center gap-6 inline-flex">
            <h1 className="text-white text-[32px] font-semibold font-geist">
              Wallpapers
            </h1>
          </header>
          
          {/* Filter Section */}
          <section 
            aria-labelledby="filter-label" 
            className="w-full flex flex-col gap-4"
          >
            <div>
              <h2 id="filter-label" className="sr-only">Filter wallpapers by category</h2>
              <RadioFilter
                options={filterOptions}
                selectedValue={selectedFilter}
                onChange={handleFilterChange}
                name="wallpaper-filter"
              />
            </div>
            
            {/* Tag Filter */}
            {availableTags.length > 0 && (
              <TagFilter
                availableTags={availableTags}
                selectedTags={selectedTags}
                onTagsChange={handleTagsChange}
              />
            )}
                    </section>
          
          {/* Cross-type Results Notification */}
          {isShowingCrossTypeResults && (
            <motion.div 
              className="w-full p-6 bg-gradient-to-r from-[#171717] to-[#1a1a1a] border border-[#333] rounded-[18px] relative overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Subtle accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8102E]/50 to-transparent"></div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#C8102E]/10 rounded-full flex items-center justify-center mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#C8102E]">
                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-white font-medium font-geist mb-2">
                    Expanded Search Results
                  </h4>
                  <p className="text-[#CCCCCC] text-sm font-geist leading-relaxed mb-2">
                    No <span className="text-white font-medium">{selectedFilter}</span> wallpapers match your selected tags.
                    We're showing results from <span className="text-[#C8102E] font-medium">all categories</span> instead.
                  </p>
                  <p className="text-[#888888] text-xs font-geist">
                    💡 Switch to the matching category or adjust your filters for more targeted results
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="w-full p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-center font-geist">
                Error loading wallpapers from Airtable: {error}
              </p>
              <p className="text-red-300/70 text-sm text-center mt-2 font-geist">
                Check console for more details
              </p>
            </div>
          )}
          
          {/* Loading State */}
          {isLoading ? (
            <div className="w-full flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <p className="text-white/60 text-sm font-geist">Loading {selectedFilter} wallpapers from Airtable...</p>
              </div>
            </div>
          ) : wallpapers.length === 0 && !error ? (
            <div className="w-full flex justify-center items-center py-20">
              <div className="text-center">
                <p className="text-white/60 text-lg mb-2 font-geist">
                  No {selectedFilter} wallpapers found
                  {selectedTags.length > 0 && ` with tags: ${selectedTags.join(', ')}`}
                </p>
                <p className="text-white/40 text-sm font-geist">
                  {selectedTags.length > 0 
                    ? 'Try removing some tag filters or selecting a different category'
                    : 'Try selecting a different category'
                  }
                </p>
              </div>
            </div>
          ) : (
            /* Wallpaper Grid - Responsive */
            <motion.section 
              className={getGridClasses()}
              aria-label="Wallpaper gallery"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {wallpapers.map((wallpaper, index) => (
                <motion.div
                  key={wallpaper.id}
                  variants={itemVariants}
                  layout
                >
                  <WallpaperCard
                    id={wallpaper.id}
                    name={wallpaper.name}
                    tags={wallpaper.tags}
                    imageUrl={wallpaper.imageUrl}
                    downloadUrl={wallpaper.downloadUrl}
                    isHot={wallpaper.isHot}
                    downloadCount={wallpaper.downloadCount}
                    alt={wallpaper.name}
                    aspectRatio={wallpaper.type}
                    index={index}
                    onTagSelect={handleTagSelect}
                  />
                </motion.div>
              ))}
            </motion.section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
