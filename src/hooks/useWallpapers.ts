import { useState, useEffect } from 'react';
import { fetchWallpapers, downloadCountStore, testWritePermissions, type Wallpaper } from '@/lib/airtable';

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

// Cache for storing all wallpapers data
let wallpapersCache: Wallpaper[] | null = null;
let cachePromise: Promise<Wallpaper[]> | null = null;
let lastKnownCount = 0;

const CACHE_KEY = 'wallpapers_cache';
const CACHE_TIMESTAMP_KEY = 'wallpapers_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache to prevent excessive API calls

// Function to save cache to session storage
function saveToSessionStorage(data: Wallpaper[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Could not save to session storage:', error);
  }
}

// Function to load cache from session storage
function loadFromSessionStorage(): Wallpaper[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_DURATION) {
        console.log('📦 Loading wallpapers from session storage');
        return JSON.parse(cached);
      } else {
        console.log('⏰ Session storage cache expired, will fetch fresh data');
        sessionStorage.removeItem(CACHE_KEY);
        sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
      }
    }
  } catch (error) {
    console.warn('Could not load from session storage:', error);
  }
  return null;
}

// Function to invalidate cache (useful for refreshing data)
export function invalidateWallpapersCache() {
  wallpapersCache = null;
  cachePromise = null;
  sessionStorage.removeItem(CACHE_KEY);
  sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
  console.log('🗑️ Wallpapers cache invalidated');
}

export function useWallpapers({ type, selectedTags = [] }: UseWallpapersOptions = {}): UseWallpapersReturn {
  const [allWallpapers, setAllWallpapers] = useState<Wallpaper[]>([]);
  const [filteredWallpapers, setFilteredWallpapers] = useState<Wallpaper[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use memory cache if available
      if (wallpapersCache) {
        console.log('✅ Using memory cached wallpapers data');
        setAllWallpapers(wallpapersCache);
        setAvailableTags(extractUniqueTags(wallpapersCache));
        downloadCountStore.initialize(wallpapersCache);
        setIsLoading(false);
        return;
      }
      
      // Try session storage cache
      const sessionData = loadFromSessionStorage();
      if (sessionData) {
        wallpapersCache = sessionData; // Also set memory cache
        setAllWallpapers(sessionData);
        setAvailableTags(extractUniqueTags(sessionData));
        downloadCountStore.initialize(sessionData);
        setIsLoading(false);
        return;
      }
      
      // If cache is being loaded, wait for it
      if (cachePromise) {
        console.log('⏳ Waiting for cache to load...');
        const cachedData = await cachePromise;
        setAllWallpapers(cachedData);
        setAvailableTags(extractUniqueTags(cachedData));
        downloadCountStore.initialize(cachedData);
        setIsLoading(false);
        return;
      }
      
      // Fetch all data once (no type filter for maximum caching)
      console.log('🔄 Fetching all wallpapers data (will be cached)...');
      cachePromise = fetchWallpapers(); // Fetch ALL wallpapers
      
      const globalData = await cachePromise;
      
      // Cache the data in memory and session storage
      wallpapersCache = globalData;
      saveToSessionStorage(globalData);
      cachePromise = null;
      
      // Track the count for detecting new uploads
      lastKnownCount = globalData.length;
      console.log(`📊 Updated known wallpaper count: ${lastKnownCount}`);
      
      setAllWallpapers(globalData);
      
      // Initialize download count store with global data
      downloadCountStore.initialize(globalData);
      
      // Test write permissions (for debugging)
      console.log('🔍 Testing Airtable write permissions...');
      const hasWritePermissions = await testWritePermissions();
      if (!hasWritePermissions) {
        console.warn('⚠️ Current API token does not have write permissions. Download counts will not sync to Airtable.');
      }
      
      // Diagnostic is available via console: diagnoseMissingWallpapers()
      
      // Extract unique tags from global data for consistent tag options
      const tags = extractUniqueTags(globalData);
      setAvailableTags(tags);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallpapers');
      console.error('Error in useWallpapers:', err);
      cachePromise = null; // Reset cache promise on error
    } finally {
      setIsLoading(false);
    }
  };

  // Filter wallpapers locally (no API calls)
  useEffect(() => {
    if (allWallpapers.length === 0) return;
    
    console.log(`🔍 FILTERING: Starting with ${allWallpapers.length} total wallpapers`);
    console.log(`🔍 FILTERING: Requested type: ${type || 'all'}`);
    console.log(`🔍 FILTERING: Selected tags: [${selectedTags.join(', ')}]`);
    
    // Filter by type locally
    const typeFiltered = type 
      ? allWallpapers.filter(wallpaper => wallpaper.type === type)
      : allWallpapers;
    
    console.log(`🔍 FILTERING: After type filter (${type}): ${typeFiltered.length} wallpapers`);
    
    // Show type distribution for debugging
    const typeDistribution = allWallpapers.reduce((acc, w) => {
      acc[w.type] = (acc[w.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('🔍 FILTERING: Type distribution:', typeDistribution);
    
    // Filter by tags locally
    const filteredByTags = filterWallpapersByTags(typeFiltered, selectedTags);
    
    console.log(`🔍 FILTERING: After tag filter: ${filteredByTags.length} wallpapers`);
    
    // If no results in current type but we have selected tags, try global search
    if (filteredByTags.length === 0 && selectedTags.length > 0 && type) {
      const globalFiltered = filterWallpapersByTags(allWallpapers, selectedTags);
      console.log(`🔍 FILTERING: Global search results: ${globalFiltered.length} wallpapers`);
      setFilteredWallpapers(globalFiltered);
    } else {
      setFilteredWallpapers(filteredByTags);
    }
  }, [allWallpapers, type, selectedTags]);

  // Fetch data only once on mount
  useEffect(() => {
    // Only clear cache if user explicitly wants to refresh, otherwise use existing cache
    fetchData();
  }, []); // Remove 'type' dependency and don't invalidate cache on mount

  // Simplified periodic refresh - just clear cache periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age > CACHE_DURATION) {
          console.log('🔄 Cache expired, refreshing wallpapers...');
          invalidateWallpapersCache();
          fetchData();
        }
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const refetch = async () => {
    invalidateWallpapersCache();
    await fetchData();
  };

  return {
    wallpapers: filteredWallpapers,
    allWallpapers,
    availableTags,
    isLoading,
    error,
    refetch
  };
} 