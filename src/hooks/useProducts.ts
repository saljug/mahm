import { useState, useEffect } from 'react';
import { fetchProducts, type Product } from '@/lib/airtable';

interface UseProductsOptions {
  selectedTags?: string[];
}

interface UseProductsReturn {
  products: Product[];
  allProducts: Product[];
  availableTags: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Helper function to extract unique tags from products
function extractUniqueTags(products: Product[]): string[] {
  const allTags = products.flatMap(product => product.tags);
  const uniqueTags = Array.from(new Set(allTags)).filter(tag => tag.trim().length > 0);
  return uniqueTags.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

// Helper function to filter products by selected tags
function filterProductsByTags(products: Product[], selectedTags: string[]): Product[] {
  if (selectedTags.length === 0) {
    return products;
  }
  
  return products.filter(product => {
    // Check if product contains ANY of the selected tags (OR logic)
    return selectedTags.some(selectedTag => 
      product.tags.some(productTag => 
        productTag.toLowerCase().includes(selectedTag.toLowerCase())
      )
    );
  });
}

// Cache for storing all products data
let productsCache: Product[] | null = null;
let cachePromise: Promise<Product[]> | null = null;

const CACHE_KEY = 'products_cache';
const CACHE_TIMESTAMP_KEY = 'products_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to save cache to session storage
function saveToSessionStorage(data: Product[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Could not save products to session storage:', error);
  }
}

// Function to load cache from session storage
function loadFromSessionStorage(): Product[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_DURATION) {
        console.log('📦 Loading products from session storage');
        return JSON.parse(cached);
      } else {
        console.log('⏰ Products session storage cache expired, will fetch fresh data');
        sessionStorage.removeItem(CACHE_KEY);
        sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
      }
    }
  } catch (error) {
    console.warn('Could not load products from session storage:', error);
  }
  return null;
}

// Function to invalidate cache (useful for refreshing data)
export function invalidateProductsCache() {
  productsCache = null;
  cachePromise = null;
  sessionStorage.removeItem(CACHE_KEY);
  sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
  console.log('🗑️ Products cache invalidated');
}

export function useProducts({ selectedTags = [] }: UseProductsOptions = {}): UseProductsReturn {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use memory cache if available
      if (productsCache) {
        console.log('✅ Using memory cached products data');
        setAllProducts(productsCache);
        setAvailableTags(extractUniqueTags(productsCache));
        setIsLoading(false);
        return;
      }
      
      // Try session storage cache
      const sessionData = loadFromSessionStorage();
      if (sessionData) {
        productsCache = sessionData; // Also set memory cache
        setAllProducts(sessionData);
        setAvailableTags(extractUniqueTags(sessionData));
        setIsLoading(false);
        return;
      }
      
      // If cache is being loaded, wait for it
      if (cachePromise) {
        console.log('⏳ Waiting for products cache to load...');
        const cachedData = await cachePromise;
        setAllProducts(cachedData);
        setAvailableTags(extractUniqueTags(cachedData));
        setIsLoading(false);
        return;
      }
      
      // Fetch all products data
      console.log('🔄 Fetching all products data (will be cached)...');
      cachePromise = fetchProducts();
      
      const globalData = await cachePromise;
      
      // Cache the data in memory and session storage
      productsCache = globalData;
      saveToSessionStorage(globalData);
      cachePromise = null;
      
      setAllProducts(globalData);
      
      // Extract unique tags from global data for consistent tag options
      const tags = extractUniqueTags(globalData);
      setAvailableTags(tags);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error in useProducts:', err);
      cachePromise = null; // Reset cache promise on error
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products locally (no API calls)
  useEffect(() => {
    if (allProducts.length === 0) return;
    
    // Filter by tags locally
    const filteredByTags = filterProductsByTags(allProducts, selectedTags);
    setFilteredProducts(filteredByTags);
  }, [allProducts, selectedTags]);

  // Fetch data only once on mount
  useEffect(() => {
    fetchData();
  }, []); // No dependencies to avoid refetching

  const refetch = async () => {
    invalidateProductsCache();
    await fetchData();
  };



  return {
    products: filteredProducts,
    allProducts,
    availableTags,
    isLoading,
    error,
    refetch
  };
}
