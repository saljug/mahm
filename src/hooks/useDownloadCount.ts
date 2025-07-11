import { useState, useEffect, useCallback } from 'react';
import { downloadCountStore } from '@/lib/airtable';

export function useDownloadCount(wallpaperId: string) {
  const [count, setCount] = useState<number>(0);
  const [formattedCount, setFormattedCount] = useState<string>('0');
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize count and subscribe to changes
  useEffect(() => {
    // Set initial count
    const initialCount = downloadCountStore.getCount(wallpaperId);
    setCount(initialCount);
    setFormattedCount(downloadCountStore.getFormattedCount(wallpaperId));

    // Subscribe to count changes for this specific wallpaper
    const unsubscribe = downloadCountStore.subscribe((updatedWallpaperId, newCount) => {
      if (updatedWallpaperId === wallpaperId) {
        setCount(newCount);
        setFormattedCount(downloadCountStore.getFormattedCount(wallpaperId));
      }
    });

    return unsubscribe;
  }, [wallpaperId]);

  // Function to increment the download count
  const incrementCount = useCallback(async () => {
    if (isUpdating) return; // Prevent double-clicks
    
    setIsUpdating(true);
    try {
      await downloadCountStore.incrementCount(wallpaperId);
    } catch (error) {
      console.error('Failed to increment download count:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [wallpaperId, isUpdating]);

  return {
    count,
    formattedCount,
    incrementCount,
    isUpdating
  };
} 