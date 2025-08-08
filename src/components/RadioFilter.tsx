import React from 'react';
import { Icon } from '@iconify/react';

interface RadioFilterProps {
  options: Array<{
    id: string;
    label: string;
    value: string;
    icon?: string;
    newCount?: number;
  }>;
  selectedValue: string;
  onChange: (value: string) => void;
  name: string;
}

export const RadioFilter: React.FC<RadioFilterProps> = ({ 
  options, 
  selectedValue, 
  onChange, 
  name 
}) => {
  return (
    <div className="flex items-start gap-6" role="radiogroup" aria-labelledby="filter-label">
      {options.map((option) => (
        <label key={option.id} className="flex items-center gap-2 cursor-pointer">
          <div className="flex w-5 h-5 justify-center items-center p-0.5 bg-[var(--ds-gray-100,#1A1A1A)] rounded-full border border-[var(--ds-gray-700,#8F8F8F)]">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
              aria-describedby={`${option.id}-label`}
            />
            {selectedValue === option.value && (
              <div className="w-2 h-2 shrink-0 bg-[var(--ds-gray-1000,#EDEDED)] rounded-full" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {option.icon && (
              <Icon 
                icon={option.icon} 
                width={16} 
                height={16} 
                className="text-[var(--ds-gray-1000,#EDEDED)]"
              />
            )}
            <span 
              id={`${option.id}-label`}
              className="text-[var(--ds-gray-1000,#EDEDED)] text-sm font-normal leading-5 font-geist"
            >
              {option.label}
            </span>
            {option.newCount && option.newCount > 0 && (
              <div className="relative group">
                <div className="flex items-center justify-center min-w-[18px] h-[18px] px-1.5 bg-[#C8102E] text-white text-xs font-semibold font-geist rounded-full shadow-lg animate-pulse-slow">
                  {option.newCount > 99 ? '99+' : option.newCount}
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#C8102E] rounded-full animate-ping-slow"></div>
                
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  {option.newCount} new item{option.newCount !== 1 ? 's' : ''} (last 3 days)
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-black"></div>
                </div>
              </div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};
