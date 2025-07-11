// Airtable service for fetching wallpaper data
interface AirtableAttachment {
  id: string;
  width: number;
  height: number;
  url: string;
  filename: string;
  size: number;
  type: string;
  thumbnails?: {
    small?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
    full?: { url: string; width: number; height: number };
  };
}

interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: {
    Name: string;
    Tags?: string[];
    Image?: AirtableAttachment[];
    Type: string[];
    'Download Link'?: string;
    'Is Hot'?: boolean;
    'Download Count'?: string;
    'Download Count Raw'?: number;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
}

export interface Wallpaper {
  id: string;
  name: string;
  tags: string[];
  downloadUrl: string;
  imageUrl: string;
  type: 'mobile' | 'desktop' | 'profile';
  isHot: boolean;
  downloadCount: string;
  downloadCountRaw: number;
}

// Airtable configuration
const AIRTABLE_BASE_ID = 'appEiIIDf9PdLxOyZ';
const AIRTABLE_API_KEY = 'pat8nQDGNPNyaHVZX.167c235ed86dbc2a243d2e118ce823f76b55fb3e7798daf4f0357c643318cabe';

// Helper function to format download count
function formatDownloadCount(count: number): string {
  if (count === 0) {
    return '0';
  } else if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  } else {
    return count.toString();
  }
}

function transformAirtableRecord(record: AirtableRecord): Wallpaper {
  const typeMap: Record<string, 'mobile' | 'desktop' | 'profile'> = {
    'Mobile': 'mobile',
    'Desktop': 'desktop',
    'Profile Picture': 'profile',
    'Profile': 'profile',
    'PP': 'profile'
  };

  // Get the main image URL (use full size if available, otherwise the main URL)
  const imageUrl = record.fields.Image && record.fields.Image.length > 0 
    ? (record.fields.Image[0].thumbnails?.full?.url || record.fields.Image[0].url)
    : '';

  // Use the image URL as download link if no download link is provided
  const downloadUrl = record.fields['Download Link'] || imageUrl;

  // Get the type (take the first one if it's an array)
  const typeValue = Array.isArray(record.fields.Type) ? record.fields.Type[0] : record.fields.Type;

  // Get raw download count - if it doesn't exist, try to parse from display string or default to 0
  let downloadCountRaw = record.fields['Download Count Raw'];
  
  if (downloadCountRaw === undefined && record.fields['Download Count']) {
    // Try to parse from existing display format (e.g., "1.5K" -> 1500)
    const displayCount = record.fields['Download Count'];
    if (displayCount.includes('K')) {
      downloadCountRaw = Math.floor(parseFloat(displayCount.replace('K', '')) * 1000);
    } else if (displayCount.includes('M')) {
      downloadCountRaw = Math.floor(parseFloat(displayCount.replace('M', '')) * 1000000);
    } else {
      downloadCountRaw = parseInt(displayCount) || 0;
    }
  }
  
  // Default to 0 if still undefined
  downloadCountRaw = downloadCountRaw || 0;
  
  // Use the formatted download count from Airtable or format the raw count
  const downloadCount = record.fields['Download Count'] || formatDownloadCount(downloadCountRaw);

  console.log(`Wallpaper ${record.fields.Name}: raw=${downloadCountRaw}, display=${downloadCount}`);

  return {
    id: record.id,
    name: record.fields.Name || 'Untitled Wallpaper',
    tags: record.fields.Tags || [],
    downloadUrl,
    imageUrl,
    type: typeMap[typeValue] || 'mobile',
    isHot: record.fields['Is Hot'] || false,
    downloadCount,
    downloadCountRaw
  };
}

export async function fetchWallpapers(type?: 'mobile' | 'desktop' | 'profile'): Promise<Wallpaper[]> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Wallpapers`;
    const params = new URLSearchParams();
    
    if (type) {
      let filterFormula = '';
      
      if (type === 'mobile') {
        filterFormula = `FIND("Mobile", ARRAYJOIN({Type}, ",")) > 0`;
      } else if (type === 'desktop') {
        filterFormula = `FIND("Desktop", ARRAYJOIN({Type}, ",")) > 0`;
      } else if (type === 'profile') {
        // Look for any profile-related values: PP, Profile, or Profile Picture
        filterFormula = `OR(FIND("PP", ARRAYJOIN({Type}, ",")) > 0, FIND("Profile", ARRAYJOIN({Type}, ",")) > 0, FIND("Profile Picture", ARRAYJOIN({Type}, ",")) > 0)`;
      }
      
      if (filterFormula) {
        params.append('filterByFormula', filterFormula);
      }
    }
    
    console.log('Fetching from Airtable:', `${url}?${params.toString()}`);
    
    const response = await fetch(`${url}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API error:', response.status, errorText);
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }
    
    const data: AirtableResponse = await response.json();
    console.log('Airtable response:', data);
    
    const wallpapers = data.records.map(transformAirtableRecord);
    console.log('Transformed wallpapers:', wallpapers);
    
    return wallpapers;
    
  } catch (error) {
    console.error('Error fetching from Airtable:', error);
    throw error; // Don't fallback to mock data, let the error show
  }
}

// Update download count in Airtable
export async function updateDownloadCount(wallpaperId: string, currentCount: number): Promise<number> {
  try {
    const newCount = currentCount + 1;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Wallpapers/${wallpaperId}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Download Count Raw': newCount,
          'Download Count': formatDownloadCount(newCount)
        }
      })
    });
    
    if (!response.ok) {
      console.error('Failed to update download count:', response.status, response.statusText);
      return currentCount; // Return original count if update fails
    }
    
    console.log(`Updated download count for ${wallpaperId}: ${currentCount} -> ${newCount}`);
    return newCount;
    
  } catch (error) {
    console.error('Error updating download count:', error);
    return currentCount; // Return original count if update fails
  }
}

// In-memory store for real-time download counts
class DownloadCountStore {
  private counts: Map<string, number> = new Map();
  private listeners: Set<(wallpaperId: string, count: number) => void> = new Set();
  private initialized: Set<string> = new Set();
  private readonly STORAGE_KEY = 'mahm-download-counts';

  constructor() {
    // Load persisted counts from localStorage on initialization
    this.loadFromStorage();
  }

  // Load counts from localStorage
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Restore counts
        if (data.counts) {
          Object.entries(data.counts).forEach(([id, count]) => {
            this.counts.set(id, count as number);
          });
        }
        
        // Restore initialized set
        if (data.initialized) {
          data.initialized.forEach((id: string) => {
            this.initialized.add(id);
          });
        }
        
        console.log('Loaded download counts from localStorage:', data);
      }
    } catch (error) {
      console.error('Failed to load download counts from localStorage:', error);
    }
  }

  // Save counts to localStorage
  private saveToStorage() {
    try {
      const data = {
        counts: Object.fromEntries(this.counts),
        initialized: Array.from(this.initialized),
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('Saved download counts to localStorage');
    } catch (error) {
      console.error('Failed to save download counts to localStorage:', error);
    }
  }

  // Initialize with data from Airtable - only set counts that don't already exist
  initialize(wallpapers: Wallpaper[]) {
    let hasChanges = false;
    
    wallpapers.forEach(wallpaper => {
      // Only initialize if we haven't seen this wallpaper before
      // This prevents overwriting incremented counts on page refresh
      if (!this.initialized.has(wallpaper.id)) {
        // If we have a stored count for this wallpaper, use the higher value
        const storedCount = this.counts.get(wallpaper.id) || 0;
        const airtableCount = wallpaper.downloadCountRaw;
        const finalCount = Math.max(storedCount, airtableCount);
        
        this.counts.set(wallpaper.id, finalCount);
        this.initialized.add(wallpaper.id);
        hasChanges = true;
        
        console.log(`Initialized count for ${wallpaper.name}: stored=${storedCount}, airtable=${airtableCount}, using=${finalCount}`);
      } else {
        console.log(`Skipping re-initialization for ${wallpaper.name}, current count: ${this.getCount(wallpaper.id)}`);
      }
    });
    
    // Save to storage if we made changes
    if (hasChanges) {
      this.saveToStorage();
    }
  }

  // Get current count
  getCount(wallpaperId: string): number {
    return this.counts.get(wallpaperId) || 0;
  }

  // Get formatted count
  getFormattedCount(wallpaperId: string): string {
    const count = this.getCount(wallpaperId);
    return formatDownloadCount(count);
  }

  // Increment count locally and update Airtable
  async incrementCount(wallpaperId: string): Promise<void> {
    const currentCount = this.getCount(wallpaperId);
    const newCount = currentCount + 1;
    
    console.log(`Incrementing count for ${wallpaperId}: ${currentCount} -> ${newCount}`);
    
    // Update locally first for instant feedback
    this.counts.set(wallpaperId, newCount);
    this.notifyListeners(wallpaperId, newCount);
    
    // Save to localStorage immediately
    this.saveToStorage();
    
    // Update Airtable in the background
    try {
      const updatedCount = await updateDownloadCount(wallpaperId, currentCount);
      console.log(`Airtable updated successfully to: ${updatedCount}`);
    } catch (error) {
      // If Airtable update fails, revert the local change
      console.error('Airtable update failed, reverting local change');
      this.counts.set(wallpaperId, currentCount);
      this.notifyListeners(wallpaperId, currentCount);
      this.saveToStorage(); // Save the reverted state
      console.error('Failed to update download count in Airtable:', error);
    }
  }

  // Subscribe to count changes
  subscribe(callback: (wallpaperId: string, count: number) => void) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(wallpaperId: string, count: number) {
    this.listeners.forEach(callback => {
      try {
        callback(wallpaperId, count);
      } catch (error) {
        console.error('Error in download count listener:', error);
      }
    });
  }

  // Debug method to see current state
  getDebugInfo() {
    return {
      counts: Object.fromEntries(this.counts),
      initialized: Array.from(this.initialized)
    };
  }

  // Clear storage (for debugging)
  clearStorage() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.counts.clear();
    this.initialized.clear();
    console.log('Cleared download count storage');
  }
}

// Export singleton instance
export const downloadCountStore = new DownloadCountStore(); 