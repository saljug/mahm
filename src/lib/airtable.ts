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
  createdTime: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: string;
  imageUrl: string;
  etsyLink: string;
  tags: string[];
  isHot: boolean;
  createdTime: string;
}

// Airtable configuration
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || 'appEiIIDf9PdLxOyZ';
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY || 'pat8nQDGNPNyaHVZX.d39ccfa7929fa2c23e8937543c0c73cdd6a8afe123556c8ec57bcbf2617d3162';

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

  // Debug: Log all available fields in this record
  console.log('Available fields in record:', Object.keys(record.fields));
  console.log('Record fields:', record.fields);

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
    downloadCountRaw,
    createdTime: record.createdTime
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
    console.log('Using API Key:', AIRTABLE_API_KEY.substring(0, 10) + '...');
    console.log('Using Base ID:', AIRTABLE_BASE_ID);
    
    const response = await fetch(`${url}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
        requestUrl: `${url}?${params.toString()}`,
        baseId: AIRTABLE_BASE_ID,
        apiKeyPrefix: AIRTABLE_API_KEY.substring(0, 10) + '...'
      });
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
    
    console.log('Attempting to update Airtable:', { wallpaperId, currentCount, newCount, url });
    
    // Only update the Download Count Raw field that we know exists
    const requestBody = {
      fields: {
        'Download Count Raw': newCount
      }
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
        requestUrl: url,
        requestBody: requestBody,
        wallpaperId: wallpaperId
      });
      
      // Try to parse the error for more details
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Parsed error:', errorJson);
      } catch (e) {
        console.error('Raw error text:', errorText);
      }
      
      return currentCount; // Return original count if update fails
    }
    
    const responseData = await response.json();
    console.log('Successful Airtable update:', responseData);
    console.log(`Updated download count for ${wallpaperId}: ${currentCount} -> ${newCount}`);
    // Dynamically import to avoid circular dependency
    try {
      const { invalidateWallpapersCache } = await import('@/hooks/useWallpapers');
      invalidateWallpapersCache();
    } catch (e) {
      console.warn('Could not invalidate cache after download count update:', e);
    }
    return newCount;
    
  } catch (error) {
    console.error('Error updating download count:', {
      error: error.message,
      stack: error.stack,
      wallpaperId,
      currentCount
    });
    return currentCount; // Return original count if update fails
  }
}

// Test function to check API write permissions
export async function testWritePermissions(): Promise<boolean> {
  try {
    // Try to get the first wallpaper and test updating it
    const wallpapers = await fetchWallpapers();
    if (wallpapers.length === 0) return false;
    
    const testWallpaper = wallpapers[0];
    console.log('Testing write permissions with wallpaper:', testWallpaper.name);
    
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Wallpapers/${testWallpaper.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          // Don't actually change anything, just test the permission
          'Download Count Raw': testWallpaper.downloadCountRaw
        }
      })
    });
    
    console.log('Write permission test - Status:', response.status);
    
    if (response.status === 403) {
      console.error('❌ API Token lacks write permissions');
      return false;
    } else if (response.status === 200) {
      console.log('✅ API Token has write permissions');
      return true;
    } else {
      const errorText = await response.text();
      console.error('Write permission test failed:', response.status, errorText);
      return false;
    }
    
  } catch (error) {
    console.error('Error testing write permissions:', error);
    return false;
  }
}

// In-memory store for real-time download counts
class DownloadCountStore {
  private counts: Map<string, number> = new Map();
  private listeners: Set<(wallpaperId: string, count: number) => void> = new Set();
  private initialized: Set<string> = new Set();

  // Initialize with data from Airtable
  initialize(wallpapers: Wallpaper[]) {
    let hasChanges = false;
    
    wallpapers.forEach(wallpaper => {
      // Always use the count from Airtable for global consistency
      this.counts.set(wallpaper.id, wallpaper.downloadCountRaw);
      this.initialized.add(wallpaper.id);
      hasChanges = true;
      
      console.log(`Initialized count for ${wallpaper.name}: ${wallpaper.downloadCountRaw}`);
    });
    
    if (hasChanges) {
      console.log('DownloadCountStore initialized with Airtable data');
    }
  }

  getCount(wallpaperId: string): number {
    return this.counts.get(wallpaperId) || 0;
  }

  getFormattedCount(wallpaperId: string): string {
    return formatDownloadCount(this.getCount(wallpaperId));
  }

  // Increment count locally and sync with Airtable
  async incrementCount(wallpaperId: string): Promise<void> {
    const currentCount = this.getCount(wallpaperId);
    const newCount = currentCount + 1;
    
    // Update local count immediately for responsiveness
    this.counts.set(wallpaperId, newCount);
    this.notifyListeners(wallpaperId, newCount);
    
    console.log(`Incremented download count for ${wallpaperId}: ${currentCount} -> ${newCount}`);
    
    // Sync with Airtable in the background
    try {
      const updatedCount = await updateDownloadCount(wallpaperId, currentCount);
      
      // Update with the actual count from Airtable (in case of conflicts)
      this.counts.set(wallpaperId, updatedCount);
      this.notifyListeners(wallpaperId, updatedCount);
      
    } catch (error) {
      console.error('Failed to sync with Airtable, rolling back:', error);
      // Rollback on failure
      this.counts.set(wallpaperId, currentCount);
      this.notifyListeners(wallpaperId, currentCount);
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

  // Notify all listeners of count changes
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
      initialized: Array.from(this.initialized),
      listenerCount: this.listeners.size
    };
  }
}

// Export singleton instance
export const downloadCountStore = new DownloadCountStore();

// Product-related functions
interface ProductAirtableRecord {
  id: string;
  createdTime: string;
  fields: {
    Name: string;
    Description?: string;
    Price?: string;
    'Image Link'?: string;
    Link?: string;
    Tags?: string[];
    'Is Hot'?: boolean;
    Trending?: boolean;
    Attachments?: AirtableAttachment[];
  };
}

function transformProductRecord(record: ProductAirtableRecord): Product {
  // Use the exact field names confirmed from the API
  const imageUrl = record.fields['Image Link'] || '';
  const etsyLink = record.fields['Link'] || '';

  return {
    id: record.id,
    name: record.fields.Name || 'Untitled Product',
    description: record.fields.Description || '',
    price: record.fields.Price || '',
    imageUrl,
    etsyLink,
    tags: record.fields.Tags || [],
    isHot: record.fields['Trending'] || record.fields['Is Hot'] || false,
    createdTime: record.createdTime
  };
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Products`;
    
    console.log('Fetching products from Airtable:', url);
    console.log('Using API Key:', AIRTABLE_API_KEY.substring(0, 10) + '...');
    console.log('Using Base ID:', AIRTABLE_BASE_ID);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Products response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable Products API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
        requestUrl: url,
        baseId: AIRTABLE_BASE_ID,
        apiKeyPrefix: AIRTABLE_API_KEY.substring(0, 10) + '...'
      });
      throw new Error(`Airtable Products API error: ${response.status} ${response.statusText}`);
    }
    
    const data: { records: ProductAirtableRecord[] } = await response.json();
    console.log('Airtable products response:', data);
    
    const products = data.records.map(transformProductRecord);
    console.log('Transformed products:', products);
    
    return products;
    
  } catch (error) {
    console.error('Error fetching products from Airtable:', error);
    throw error;
  }
} 