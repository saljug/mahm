import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
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
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-downloaded' | 'least-downloaded'>('newest');

  const { wallpapers: rawWallpapers, allWallpapers, availableTags, isLoading, error, refetch } = useWallpapers({ 
    type: selectedFilter,
    selectedTags 
  });

  // Sort wallpapers based on selected sort option
  const wallpapers = useMemo(() => {
    if (!rawWallpapers) return [];
    
    const sorted = [...rawWallpapers];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime());
      case 'most-downloaded':
        return sorted.sort((a, b) => Number(b.downloadCountRaw || 0) - Number(a.downloadCountRaw || 0));
      case 'least-downloaded':
        return sorted.sort((a, b) => Number(a.downloadCountRaw || 0) - Number(b.downloadCountRaw || 0));
      default:
        return sorted;
    }
  }, [rawWallpapers, sortBy]);

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

  const handleSortChange = (value: string) => {
    setSortBy(value as 'newest' | 'oldest' | 'most-downloaded' | 'least-downloaded');
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
      <main className="lg:ml-[270px] flex-1 px-5 pt-8 pb-24 lg:pb-8 overflow-hidden flex-col justify-start items-start gap-[52px] flex">
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
            
                        {/* Tag Filter with Item Count and Sorting */}
            {availableTags.length > 0 && (
              <div className="w-full">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white text-sm font-medium font-geist">
                      Filter by Tags {selectedTags.length > 0 && `(${selectedTags.length} selected)`}
                    </h3>
                    {!isLoading && wallpapers.length > 0 && (
                      <span className="text-[#737373] text-sm font-geist">
                        • {wallpapers.length} {wallpapers.length === 1 ? 'Item' : 'Items'} Listed
                      </span>
                    )}
                  </div>
                  
                  {!isLoading && wallpapers.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-white/70 text-sm font-medium font-geist">Sort by:</span>
                      <div className="relative group">
                        <select
                          value={sortBy}
                          onChange={(e) => handleSortChange(e.target.value)}
                          className="bg-[#171717] text-white text-sm border border-[#333] rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-[#C8102E] hover:border-[#555] transition-all duration-200 font-geist appearance-none cursor-pointer shadow-sm hover:shadow-md focus:shadow-lg"
                        >
                          <option value="newest" className="bg-[#171717] text-white">Newest First</option>
                          <option value="oldest" className="bg-[#171717] text-white">Oldest First</option>
                          <option value="most-downloaded" className="bg-[#171717] text-white">Most Downloaded</option>
                          <option value="least-downloaded" className="bg-[#171717] text-white">Least Downloaded</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 group-hover:scale-110">
                          <Icon 
                            icon="solar:alt-arrow-down-linear" 
                            width={16} 
                            height={16} 
                            className="text-white/60 group-hover:text-white/80"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTags(selectedTags.filter(t => t !== tag));
                          } else {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium font-geist transition-colors ${
                          isSelected
                            ? 'bg-[#C8102E] text-white'
                            : 'bg-[#171717] text-[#EDEDED] hover:bg-[#171717]/80 border border-[#333]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                  
                  {/* Clear all button */}
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="px-3 py-1.5 rounded-full text-xs font-medium font-geist bg-[#171717] text-[#737373] hover:text-white hover:bg-[#171717]/80 border border-[#333] transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                                 {selectedTags.length > 0 && (
                   <div className="mt-3 text-xs text-[#737373] font-geist">
                     Showing wallpapers with any selected tags
                   </div>
                 )}
                </div>
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
                <p className="text-white/60 text-sm font-geist">Loading...</p>
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
          
          {/* Footer - Terms Reference */}
          {!isLoading && wallpapers.length > 0 && (
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 py-8 px-4 text-center border-t border-[#333]/30 mt-12">
              <div className="flex items-center gap-2 text-[#737373] text-sm">
                <Icon icon="solar:shield-check-linear" width={16} height={16} />
                <span>By downloading wallpapers, you agree to our</span>
              </div>
              <a 
                href="/about" 
                className="text-[#C8102E] hover:text-[#C8102E]/80 text-sm font-medium transition-colors underline decoration-dotted underline-offset-2"
              >
                Terms of Use
              </a>
              <span className="text-[#737373] text-sm">• Personal use only</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
