import { useState, useEffect } from 'react';
import { fetchWallpapers, type Wallpaper } from '@/lib/airtable';

interface UseWallpapersOptions {
  type?: 'mobile' | 'desktop' | 'profile';
  selectedTags?: string[];
}

interface UseWallpapersReturn {
  wallpapers: Wallpaper[];
  allWallpapers: Wallpaper[];
  availableTags: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Helper function to extract unique tags from wallpapers
function extractUniqueTags(wallpapers: Wallpaper[]): string[] {
  const allTags = wallpapers.flatMap(wallpaper => wallpaper.tags);
  const uniqueTags = Array.from(new Set(allTags)).filter(tag => tag.trim().length > 0);
  return uniqueTags.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

// Helper function to filter wallpapers by selected tags
function filterWallpapersByTags(wallpapers: Wallpaper[], selectedTags: string[]): Wallpaper[] {
  if (selectedTags.length === 0) {
    return wallpapers;
  }
  
  return wallpapers.filter(wallpaper => {
    // Check if wallpaper contains ANY of the selected tags (OR logic)
    return selectedTags.some(selectedTag => 
      wallpaper.tags.some(wallpaperTag => 
        wallpaperTag.toLowerCase().includes(selectedTag.toLowerCase())
      )
    );
  });
}

export function useWallpapers({ type, selectedTags = [] }: UseWallpapersOptions = {}): UseWallpapersReturn {
  const [allWallpapers, setAllWallpapers] = useState<Wallpaper[]>([]);
  const [globalWallpapers, setGlobalWallpapers] = useState<Wallpaper[]>([]);
  const [filteredWallpapers, setFilteredWallpapers] = useState<Wallpaper[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch data for current type
      const typeData = await fetchWallpapers(type);
      setAllWallpapers(typeData);
      
      // Also fetch global data (all types) for cross-type filtering and tags
      const globalData = await fetchWallpapers();
      setGlobalWallpapers(globalData);
      
      // Extract unique tags from global data for consistent tag options
      const tags = extractUniqueTags(globalData);
      setAvailableTags(tags);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallpapers');
      console.error('Error in useWallpapers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter wallpapers with global fallback logic
  useEffect(() => {
    // First try to filter current type wallpapers
    const filteredCurrentType = filterWallpapersByTags(allWallpapers, selectedTags);
    
    // If no results in current type but we have selected tags, try global search
    if (filteredCurrentType.length === 0 && selectedTags.length > 0) {
      const filteredGlobal = filterWallpapersByTags(globalWallpapers, selectedTags);
      setFilteredWallpapers(filteredGlobal);
    } else {
      setFilteredWallpapers(filteredCurrentType);
    }
  }, [allWallpapers, globalWallpapers, selectedTags]);

  // Fetch data when type changes
  useEffect(() => {
    fetchData();
  }, [type]);

  return {
    wallpapers: filteredWallpapers,
    allWallpapers,
    availableTags,
    isLoading,
    error,
    refetch: fetchData
  };
} 