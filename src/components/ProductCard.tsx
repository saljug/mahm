import React from 'react';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/Badge';
import { type Product } from '@/lib/airtable';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent onClick
    if (product.etsyLink) {
      window.open(product.etsyLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCardClick = () => {
    // If product has Etsy link, open it; otherwise call the original onClick
    if (product.etsyLink) {
      window.open(product.etsyLink, '_blank', 'noopener,noreferrer');
    } else {
      onClick?.();
    }
  };

  return (
    <div 
      className={`group relative bg-[#171717] rounded-[20px] overflow-hidden transition-all duration-300 flex flex-col h-full ${
        product.etsyLink 
          ? 'cursor-pointer hover:bg-[#1F1F1F]' 
          : 'cursor-default hover:bg-[#1A1A1A]'
      }`}
      onClick={handleCardClick}
    >


      {/* Product Image - 1:1 aspect ratio */}
      <div className="relative w-full aspect-square overflow-hidden bg-[#0A0A0A] rounded-t-[20px]">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon 
              icon="solar:gallery-minimalistic-linear" 
              className="text-[#737373] text-4xl" 
            />
          </div>
        )}
        
        {/* HOT Text Overlay */}
        {product.isHot && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            HOT
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1">
        {/* Content that can vary in height */}
        <div className="flex-1 space-y-3 mb-4">
          {/* Title and Price */}
          <div className="space-y-1">
            <h3 className="text-white font-semibold text-lg leading-tight group-hover:text-white/90 transition-colors">
              {product.name}
            </h3>
            {product.price && (
              <p className="text-green-400 font-bold text-lg">
                {product.price}
              </p>
            )}
            {product.description && (
              <p className="text-[#737373] text-sm line-clamp-2">
                {product.description}
              </p>
            )}
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="text-xs bg-[#262626] text-[#A3A3A3] hover:bg-[#333] transition-colors"
                >
                  {tag}
                </Badge>
              ))}
              {product.tags.length > 3 && (
                <Badge 
                  variant="secondary"
                  className="text-xs bg-[#262626] text-[#A3A3A3]"
                >
                  +{product.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Buy Now Button - Always at bottom */}
        <button
          onClick={handleBuyNow}
          disabled={!product.etsyLink}
          className={`w-full py-3 px-4 rounded-[12px] font-semibold text-sm transition-all duration-200 flex items-center justify-center ${
            product.etsyLink
              ? 'bg-[#FF6B35] hover:bg-[#E85A2E] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-[#333] text-[#666] cursor-not-allowed'
          }`}
        >
          {product.etsyLink ? 'Get Now on Etsy' : 'Coming Soon'}
        </button>
      </div>
    </div>
  );
};
