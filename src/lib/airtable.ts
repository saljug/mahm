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
}

// Airtable configuration
const AIRTABLE_BASE_ID = 'appEiIIDf9PdLxOyZ';
const AIRTABLE_API_KEY = 'pat8nQDGNPNyaHVZX.167c235ed86dbc2a243d2e118ce823f76b55fb3e7798daf4f0357c643318cabe';

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

  return {
    id: record.id,
    name: record.fields.Name || 'Untitled Wallpaper',
    tags: record.fields.Tags || [],
    downloadUrl,
    imageUrl,
    type: typeMap[typeValue] || 'mobile',
    isHot: record.fields['Is Hot'] || false,
    downloadCount: record.fields['Download Count'] || '1K'
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