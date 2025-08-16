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
  offset?: string;
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

  // Debug: Log all available fields in this record (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Available fields in record:', Object.keys(record.fields));
    console.log('Record fields:', record.fields);
  }

  // Get the main image URL (use full size if available, otherwise the main URL)
  const imageUrl = record.fields.Image && record.fields.Image.length > 0 
    ? (record.fields.Image[0].thumbnails?.full?.url || record.fields.Image[0].url)
    : '';

  // DEBUG: Log image processing details for records without images
  if (process.env.NODE_ENV === 'development' && (!imageUrl || imageUrl.length === 0)) {
    console.log('🚨 Record without image:', {
      id: record.id,
      name: record.fields.Name,
      hasImageField: !!record.fields.Image,
      imageArrayLength: record.fields.Image ? record.fields.Image.length : 0,
      imageArray: record.fields.Image,
      allFields: Object.keys(record.fields)
    });
  }

  // Use the image URL as download link if no download link is provided
  const downloadUrl = record.fields['Download Link'] || imageUrl;

  // Get the type (take the first one if it's an array)
  const typeValue = Array.isArray(record.fields.Type) ? record.fields.Type[0] : record.fields.Type;
  
  // IMPROVED: Also check tags for type inference if Type field is missing or unclear
  let inferredType: 'mobile' | 'desktop' | 'profile' = typeMap[typeValue] || 'mobile';
  
  // If we couldn't map the type from the Type field, try to infer from tags
  if (!typeMap[typeValue] && record.fields.Tags) {
    const tags = record.fields.Tags;
    const hasProfileTag = tags.some(tag => 
      ['pp', 'profile', 'profile picture', 'avatar'].includes(tag.toLowerCase())
    );
    const hasDesktopTag = tags.some(tag => 
      ['desktop', 'pc', 'computer', 'wallpaper'].includes(tag.toLowerCase())
    );
    const hasMobileTag = tags.some(tag => 
      ['mobile', 'phone', 'smartphone'].includes(tag.toLowerCase())
    );
    
    if (hasProfileTag) {
      inferredType = 'profile';
    } else if (hasDesktopTag) {
      inferredType = 'desktop';
    } else if (hasMobileTag) {
      inferredType = 'mobile';
    }
  }

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

  if (process.env.NODE_ENV === 'development') {
    console.log(`Wallpaper ${record.fields.Name}: raw=${downloadCountRaw}, display=${downloadCount}, type=${inferredType}`);
  }

  return {
    id: record.id,
    name: record.fields.Name || 'Untitled Wallpaper',
    tags: record.fields.Tags || [],
    downloadUrl,
    imageUrl,
    type: inferredType,
    isHot: record.fields['Is Hot'] || false,
    downloadCount,
    downloadCountRaw,
    createdTime: record.createdTime
  };
}

// Helper function to fetch ALL records from Airtable with pagination support
async function fetchAllAirtableRecords(filterFormula?: string): Promise<AirtableRecord[]> {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Wallpapers`;
  let allRecords: AirtableRecord[] = [];
  let offset: string | undefined;
  
  do {
    const params = new URLSearchParams();
    
    if (filterFormula) {
      params.append('filterByFormula', filterFormula);
    }
    
    if (offset) {
      params.append('offset', offset);
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
    allRecords.push(...data.records);
    offset = data.offset;
    
    console.log(`Fetched ${data.records.length} records, total so far: ${allRecords.length}${offset ? ', more available...' : ', complete'}`);
    
  } while (offset);
  
  return allRecords;
}

export async function fetchWallpapers(type?: 'mobile' | 'desktop' | 'profile'): Promise<Wallpaper[]> {
  try {
    let filterFormula = '';
    
    if (type) {
      if (type === 'mobile') {
        filterFormula = `FIND("Mobile", ARRAYJOIN({Type}, ",")) > 0`;
      } else if (type === 'desktop') {
        filterFormula = `FIND("Desktop", ARRAYJOIN({Type}, ",")) > 0`;
      } else if (type === 'profile') {
        // Look for any profile-related values: PP, Profile, or Profile Picture
        filterFormula = `OR(FIND("PP", ARRAYJOIN({Type}, ",")) > 0, FIND("Profile", ARRAYJOIN({Type}, ",")) > 0, FIND("Profile Picture", ARRAYJOIN({Type}, ",")) > 0)`;
      }
    }
    
    console.log('Using API Key:', AIRTABLE_API_KEY.substring(0, 10) + '...');
    console.log('Using Base ID:', AIRTABLE_BASE_ID);
    console.log('Filter:', filterFormula || 'none (all records)');
    
    // Fetch all records with pagination support
    const allRecords = await fetchAllAirtableRecords(filterFormula);
    
    console.log('Response status: 200 (multiple requests if paginated)');
    
    const data = { records: allRecords };
    console.log('Airtable response:', data);
    
    // DIAGNOSTIC: Log detailed info about records for debugging
    console.log('🔍 DIAGNOSTIC - Records Analysis:');
    console.log(`Total records fetched from Airtable: ${data.records.length}`);
    console.log(`Filter used: ${type || 'none (all records)'}`);
    
    if (data.records.length > 0) {
      // Show first few records for debugging
      data.records.slice(0, 3).forEach((record, index) => {
        const hasImage = record.fields.Image && record.fields.Image.length > 0;
        const imageUrl = hasImage ? (record.fields.Image[0].thumbnails?.full?.url || record.fields.Image[0].url) : 'NO IMAGE';
        const typeValue = Array.isArray(record.fields.Type) ? record.fields.Type.join(', ') : record.fields.Type;
        
        console.log(`Record ${index + 1}:`, {
          id: record.id,
          name: record.fields.Name,
          type: typeValue,
          hasImage,
          imageUrl: imageUrl.substring(0, 50) + (imageUrl.length > 50 ? '...' : ''),
          tags: record.fields.Tags || [],
          createdTime: record.createdTime
        });
      });
      
      if (data.records.length > 3) {
        console.log(`... and ${data.records.length - 3} more records`);
      }
    }
    
    const wallpapers = data.records.map(transformAirtableRecord);
    console.log('Transformed wallpapers:', wallpapers);
    
    // FILTER OUT WALLPAPERS WITHOUT IMAGES
    // Records without images shouldn't be displayed to users
    const validWallpapers = wallpapers.filter(w => w.imageUrl && w.imageUrl.length > 0);
    const invalidWallpapers = wallpapers.filter(w => !w.imageUrl || w.imageUrl.length === 0);
    
    console.log('🔍 DIAGNOSTIC - Transformation Results:');
    console.log(`Total records from Airtable: ${wallpapers.length}`);
    console.log(`Valid wallpapers (with images): ${validWallpapers.length}`);
    console.log(`Invalid wallpapers (no images): ${invalidWallpapers.length}`);
    
    if (invalidWallpapers.length > 0) {
      console.log('❌ Records without images (filtered out):', invalidWallpapers.map(w => ({
        id: w.id,
        name: w.name,
        imageUrl: w.imageUrl,
        type: w.type,
        downloadCount: w.downloadCount
      })));
      console.warn(`⚠️ ${invalidWallpapers.length} wallpapers were excluded because they don't have images. Check Airtable to ensure all records have image attachments.`);
    }
    
    return validWallpapers;
    
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

// Quick function to check total wallpaper count without fetching all data
export async function getWallpaperCount(): Promise<number> {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Wallpapers`;
    const params = new URLSearchParams();
    params.append('fields[]', 'Name'); // Only fetch minimal data
    params.append('maxRecords', '1000'); // Ensure we get all records for count
    
    const response = await fetch(`${url}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }
    
    const data: AirtableResponse = await response.json();
    return data.records.length;
  } catch (error) {
    console.error('Error getting wallpaper count:', error);
    return 0;
  }
}

// SPECIFIC DIAGNOSTIC: Find missing mobile wallpapers
export async function diagnoseMissingMobileWallpapers(): Promise<void> {
  try {
    console.log('🔍 MOBILE DIAGNOSTIC: Analyzing mobile wallpaper discrepancy...');
    
    // 1. Fetch ALL wallpapers to see the full picture
    console.log('📊 Step 1: Fetching ALL wallpapers...');
    const allWallpapers = await fetchWallpapers();
    
    // 2. Fetch MOBILE wallpapers specifically using Airtable filter
    console.log('📊 Step 2: Fetching MOBILE wallpapers with Airtable filter...');
    const mobileFromFilter = await fetchWallpapers('mobile');
    
    // 3. Filter mobile wallpapers locally from all data
    const mobileFromLocal = allWallpapers.filter(w => w.type === 'mobile');
    
    console.log('📊 MOBILE ANALYSIS RESULTS:');
    console.log(`- All wallpapers total: ${allWallpapers.length}`);
    console.log(`- Mobile via Airtable filter: ${mobileFromFilter.length}`);
    console.log(`- Mobile via local filtering: ${mobileFromLocal.length}`);
    
    // 4. Find wallpapers that might be tagged as mobile but not classified as mobile type
    const mobileTagged = allWallpapers.filter(w => 
      w.tags.some(tag => tag.toLowerCase().includes('mobile'))
    );
    console.log(`- Wallpapers with 'mobile' in tags: ${mobileTagged.length}`);
    
    // 5. Check for wallpapers that should be mobile but aren't
    const shouldBeMobile = allWallpapers.filter(w => {
      const hasMobileTag = w.tags.some(tag => tag.toLowerCase().includes('mobile'));
      const hasMobileInName = w.name.toLowerCase().includes('mobile');
      return (hasMobileTag || hasMobileInName) && w.type !== 'mobile';
    });
    
    if (shouldBeMobile.length > 0) {
      console.log('⚠️ Wallpapers that seem mobile but are classified differently:');
      shouldBeMobile.forEach(w => {
        console.log(`- "${w.name}" (type: ${w.type}, tags: [${w.tags.join(', ')}])`);
      });
    }
    
    // 6. Look for records without images
    const mobileWithoutImages = mobileFromLocal.filter(w => !w.imageUrl || w.imageUrl.length === 0);
    if (mobileWithoutImages.length > 0) {
      console.log('❌ Mobile wallpapers without images (won\'t display):');
      mobileWithoutImages.forEach(w => {
        console.log(`- "${w.name}" (id: ${w.id})`);
      });
    }
    
    // 7. Check the Airtable raw data for mobile records
    console.log('📊 Step 3: Checking raw Airtable data for mobile records...');
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Wallpapers`;
    const params = new URLSearchParams();
    params.append('filterByFormula', 'FIND("Mobile", ARRAYJOIN({Type}, ",")) > 0');
    
    const response = await fetch(`${url}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const rawData: AirtableResponse = await response.json();
      console.log(`- Raw mobile records from Airtable: ${rawData.records.length}`);
      
      // Show records that might be missing images
      const recordsWithoutImages = rawData.records.filter(r => 
        !r.fields.Image || r.fields.Image.length === 0
      );
      
      if (recordsWithoutImages.length > 0) {
        console.log('❌ Raw records without images:');
        recordsWithoutImages.forEach(r => {
          console.log(`- "${r.fields.Name}" (id: ${r.id})`);
        });
      }
      
      console.log('📋 MOBILE SUMMARY:');
      console.log(`- Expected mobile wallpapers (Airtable): ${rawData.records.length}`);
      console.log(`- Actual mobile wallpapers (website): ${mobileFromLocal.length}`);
      console.log(`- Missing: ${rawData.records.length - mobileFromLocal.length}`);
      console.log(`- Records without images: ${recordsWithoutImages.length}`);
    }
    
  } catch (error) {
    console.error('❌ Mobile diagnostic failed:', error);
  }
}

// DIAGNOSTIC FUNCTION: Check Airtable pagination and filtering issues
export async function diagnoseAirtableFetching(): Promise<void> {
  try {
    console.log('🔍 AIRTABLE FETCHING DIAGNOSTIC: Analyzing fetch behavior...');
    
    // 1. Check total count with proper pagination
    console.log('📊 Step 1: Checking total record count with pagination...');
    const allRecords = await fetchAllAirtableRecords();
    console.log(`Total records in Airtable: ${allRecords.length}`);
    
    // 2. Test our current filtering for PP
    console.log('📊 Step 2: Testing PP filtering...');
    const ppUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Wallpapers`;
    const ppParams = new URLSearchParams();
    ppParams.append('filterByFormula', `OR(FIND("PP", ARRAYJOIN({Type}, ",")) > 0, FIND("Profile", ARRAYJOIN({Type}, ",")) > 0, FIND("Profile Picture", ARRAYJOIN({Type}, ",")) > 0)`);
    
    const ppResponse = await fetch(`${ppUrl}?${ppParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const ppData: AirtableResponse = await ppResponse.json();
    console.log(`PP records found by filter: ${ppData.records.length}`);
    
    // 3. Test our current filtering for Mobile
    console.log('📊 Step 3: Testing Mobile filtering...');
    const mobileUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Wallpapers`;
    const mobileParams = new URLSearchParams();
    mobileParams.append('filterByFormula', `FIND("Mobile", ARRAYJOIN({Type}, ",")) > 0`);
    
    const mobileResponse = await fetch(`${mobileUrl}?${mobileParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const mobileData: AirtableResponse = await mobileResponse.json();
    console.log(`Mobile records found by filter: ${mobileData.records.length}`);
    
    // 4. Check what our website is actually showing
    console.log('📊 Step 4: Checking website display...');
    const websiteAll = await fetchWallpapers();
    const websitePP = await fetchWallpapers('profile');
    const websiteMobile = await fetchWallpapers('mobile');
    
    console.log(`Website shows - All: ${websiteAll.length}, PP: ${websitePP.length}, Mobile: ${websiteMobile.length}`);
    
    // 5. Analyze Type field values in all records
    console.log('📊 Step 5: Analyzing Type field values...');
    const typeAnalysis: Record<string, number> = {};
    allRecords.forEach(record => {
      const typeValue = Array.isArray(record.fields.Type) ? record.fields.Type.join(',') : record.fields.Type || 'NO_TYPE';
      typeAnalysis[typeValue] = (typeAnalysis[typeValue] || 0) + 1;
    });
    
    console.log('Type field distribution:', typeAnalysis);
    
    console.log('\n🔍 SUMMARY:');
    console.log(`- Airtable total: ${allRecords.length}`);
    console.log(`- PP filter finds: ${ppData.records.length}`);
    console.log(`- Mobile filter finds: ${mobileData.records.length}`);
    console.log(`- Website shows PP: ${websitePP.length}`);
    console.log(`- Website shows Mobile: ${websiteMobile.length}`);
    console.log(`- Potential PP missing: ${ppData.records.length - websitePP.length}`);
    console.log(`- Potential Mobile missing: ${mobileData.records.length - websiteMobile.length}`);
    
  } catch (error) {
    console.error('❌ Airtable fetching diagnostic failed:', error);
  }
}

// DIAGNOSTIC FUNCTION: Show detailed breakdown of missing images
export async function diagnoseMissingImages(): Promise<void> {
  try {
    console.log('🔍 MISSING IMAGES DIAGNOSTIC: Analyzing PP and Mobile sections...');
    
    // Fetch all records to get the complete picture with pagination
    console.log('📊 Step 1: Fetching ALL wallpapers with pagination...');
    const allRecords = await fetchAllAirtableRecords();
    
    console.log(`Total records in Airtable: ${allRecords.length}`);
    
    // Analyze PP section
    const ppRecords = allRecords.filter(r => {
      const type = Array.isArray(r.fields.Type) ? r.fields.Type.join(',') : r.fields.Type || '';
      return type.includes('PP') || type.includes('Profile');
    });
    
    const ppWithImages = ppRecords.filter(r => r.fields.Image && r.fields.Image.length > 0);
    const ppWithoutImages = ppRecords.filter(r => !r.fields.Image || r.fields.Image.length === 0);
    
    // Analyze Mobile section
    const mobileRecords = allRecords.filter(r => {
      const type = Array.isArray(r.fields.Type) ? r.fields.Type.join(',') : r.fields.Type || '';
      return type.includes('Mobile');
    });
    
    const mobileWithImages = mobileRecords.filter(r => r.fields.Image && r.fields.Image.length > 0);
    const mobileWithoutImages = mobileRecords.filter(r => !r.fields.Image || r.fields.Image.length === 0);
    
    console.log('\n📊 PP SECTION ANALYSIS:');
    console.log(`- Total PP records in Airtable: ${ppRecords.length}`);
    console.log(`- PP records WITH images: ${ppWithImages.length}`);
    console.log(`- PP records WITHOUT images: ${ppWithoutImages.length}`);
    console.log(`- PP records that will be shown on website: ${ppWithImages.length}`);
    
    console.log('\n📊 MOBILE SECTION ANALYSIS:');
    console.log(`- Total Mobile records in Airtable: ${mobileRecords.length}`);
    console.log(`- Mobile records WITH images: ${mobileWithImages.length}`);
    console.log(`- Mobile records WITHOUT images: ${mobileWithoutImages.length}`);
    console.log(`- Mobile records that will be shown on website: ${mobileWithImages.length}`);
    
    console.log(`\n🚨 TOTAL MISSING IMAGES: ${ppWithoutImages.length + mobileWithoutImages.length}`);
    
    if (ppWithoutImages.length > 0) {
      console.log('\n❌ PP records without images:');
      ppWithoutImages.forEach((r, i) => {
        console.log(`${i + 1}. "${r.fields.Name}" (ID: ${r.id})`);
      });
    }
    
    if (mobileWithoutImages.length > 0) {
      console.log('\n❌ Mobile records without images:');
      mobileWithoutImages.forEach((r, i) => {
        console.log(`${i + 1}. "${r.fields.Name}" (ID: ${r.id})`);
      });
    }
    
    console.log('\n💡 SOLUTION: The missing images are now filtered out automatically.');
    console.log('   Records without image attachments in Airtable will no longer appear on the website.');
    console.log('   To restore these wallpapers, add image attachments to the missing records in Airtable.');
    
  } catch (error) {
    console.error('❌ Missing images diagnostic failed:', error);
  }
}

// DIAGNOSTIC FUNCTION: Compare Airtable data with website display
export async function diagnoseMissingWallpapers(): Promise<void> {
  try {
    console.log('🔍 DIAGNOSTIC: Starting comprehensive wallpaper analysis...');
    
    // 1. Fetch all wallpapers without any filters
    console.log('📊 Step 1: Fetching ALL wallpapers from Airtable...');
    const allWallpapers = await fetchWallpapers();
    console.log(`Total wallpapers fetched: ${allWallpapers.length}`);
    
    // 2. Fetch profile wallpapers specifically  
    console.log('📊 Step 2: Fetching PROFILE wallpapers specifically...');
    const profileWallpapers = await fetchWallpapers('profile');
    console.log(`Profile wallpapers fetched: ${profileWallpapers.length}`);
    
    // 3. Analyze type distribution
    const typeDistribution = allWallpapers.reduce((acc, w) => {
      acc[w.type] = (acc[w.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📊 Type Distribution:', typeDistribution);
    
    // 4. Find wallpapers with PP-related tags but not classified as profile
    const ppTaggedWallpapers = allWallpapers.filter(w => 
      w.tags.some(tag => ['pp', 'profile', 'profile picture', 'avatar'].includes(tag.toLowerCase()))
    );
    
    console.log(`📊 Wallpapers with PP-related tags: ${ppTaggedWallpapers.length}`);
    
    const ppTaggedButNotProfile = ppTaggedWallpapers.filter(w => w.type !== 'profile');
    if (ppTaggedButNotProfile.length > 0) {
      console.log('⚠️ PP-tagged wallpapers NOT classified as profile:', ppTaggedButNotProfile.map(w => ({
        id: w.id,
        name: w.name,
        type: w.type,
        tags: w.tags,
        hasImage: !!w.imageUrl
      })));
    }
    
    // 5. Check for wallpapers without images
    const wallpapersWithoutImages = allWallpapers.filter(w => !w.imageUrl || w.imageUrl.length === 0);
    console.log(`📊 Wallpapers without images: ${wallpapersWithoutImages.length}`);
    if (wallpapersWithoutImages.length > 0) {
      console.log('❌ Wallpapers without images:', wallpapersWithoutImages.map(w => ({
        id: w.id,
        name: w.name,
        type: w.type,
        tags: w.tags
      })));
    }
    
    // 6. Summary
    console.log('📋 DIAGNOSTIC SUMMARY:');
    console.log(`- Total wallpapers in Airtable: ${allWallpapers.length}`);
    console.log(`- Profile type wallpapers: ${typeDistribution.profile || 0}`);
    console.log(`- PP-tagged wallpapers: ${ppTaggedWallpapers.length}`);
    console.log(`- Wallpapers without images: ${wallpapersWithoutImages.length}`);
    console.log(`- Expected PP count on website: ${(typeDistribution.profile || 0) - wallpapersWithoutImages.filter(w => w.type === 'profile').length}`);
    
    // 7. Cache analysis
    const profileFromCache = allWallpapers.filter(w => w.type === 'profile');
    console.log(`- Profile wallpapers from cached data: ${profileFromCache.length}`);
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

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