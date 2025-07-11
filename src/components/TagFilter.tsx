import React from 'react';
import { motion } from 'framer-motion';

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  availableTags,
  selectedTags,
  onTagsChange
}) => {
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // Remove tag
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      // Add tag
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-3">
        <h3 className="text-white text-sm font-medium font-geist">
          Filter by Tags {selectedTags.length > 0 && `(${selectedTags.length} selected)`}
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <motion.button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium font-geist transition-colors ${
                isSelected
                  ? 'bg-[#C8102E] text-white'
                  : 'bg-[#171717] text-[#EDEDED] hover:bg-[#171717]/80 border border-[#333]'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              {tag}
            </motion.button>
          );
        })}
        
        {/* Clear all button positioned closer to tags */}
        {selectedTags.length > 0 && (
          <button
            onClick={clearAllTags}
            className="px-3 py-1.5 rounded-full text-xs font-medium font-geist bg-[#171717] text-[#737373] hover:text-white hover:bg-[#171717]/80 border border-[#333] transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
      
      {selectedTags.length > 0 && (
        <div className="mt-3 text-xs text-[#737373] font-geist">
          Showing wallpapers with any selected tags
        </div>
      )}
    </div>
  );
}; 