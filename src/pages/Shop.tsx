import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Sidebar } from '@/components/Sidebar';
import { MobileNavbar } from '@/components/MobileNavbar';
import { ProductCard } from '@/components/ProductCard';
import { TagFilter } from '@/components/TagFilter';
import { useProducts } from '@/hooks/useProducts';

const Shop: React.FC = () => {
  const [activeItem, setActiveItem] = useState('shop');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { products, availableTags, isLoading, error, refetch } = useProducts({
    selectedTags
  });

  const handleItemClick = (item: string) => {
    setActiveItem(item);
  };

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#0A0A0A]">
        <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
        <main className="flex-1 lg:ml-[270px] pb-20 lg:pb-0">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-white text-2xl font-bold mb-2">Failed to Load Products</h1>
              <p className="text-[#737373] mb-4">{error}</p>
              <button 
                onClick={refetch}
                className="bg-[#FF6B35] hover:bg-[#E85A2E] text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
        <MobileNavbar activeItem={activeItem} onItemClick={handleItemClick} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
      
      <main className="lg:ml-[270px] flex-1 px-5 pt-8 pb-24 lg:pb-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4">
              <h1 className="text-white text-3xl font-bold">Shop</h1>
            </div>
            <p className="text-[#737373] text-lg">
              Discover our premium products available on Etsy
            </p>
          </div>

          {/* Filters */}
          {availableTags.length > 0 && (
            <div className="mb-8">
              <TagFilter
                availableTags={availableTags}
                selectedTags={selectedTags}
                onTagsChange={handleTagsChange}
              />
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, index) => (
                <div 
                  key={index}
                  className="bg-[#171717] rounded-[20px] overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-[#262626]" />
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-[#262626] rounded" />
                    <div className="h-4 bg-[#262626] rounded w-2/3" />
                    <div className="h-10 bg-[#262626] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Products Count */}
              <div className="mb-6">
                <p className="text-[#737373]">
                  {products.length} {products.length === 1 ? 'product' : 'products'} found
                  {selectedTags.length > 0 && (
                    <span className="ml-2">
                      for tags: {selectedTags.map(tag => `"${tag}"`).join(', ')}
                    </span>
                  )}
                </p>
              </div>

              {/* Products Grid */}
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-[#737373] text-6xl mb-4">🛍️</div>
                  <h2 className="text-white text-2xl font-bold mb-2">No Products Found</h2>
                  <p className="text-[#737373] mb-4">
                    {selectedTags.length > 0 
                      ? 'Try adjusting your filters or browse all products.'
                      : 'Products are coming soon! Check back later.'}
                  </p>
                  {selectedTags.length > 0 && (
                    <button 
                      onClick={() => setSelectedTags([])}
                      className="bg-[#FF6B35] hover:bg-[#E85A2E] text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </>
          )}
      </main>

      <MobileNavbar activeItem={activeItem} onItemClick={handleItemClick} />
    </div>
  );
};

export default Shop;
