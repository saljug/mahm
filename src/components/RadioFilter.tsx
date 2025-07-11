import React from 'react';
import { Icon } from '@iconify/react';

interface RadioFilterProps {
  options: Array<{
    id: string;
    label: string;
    value: string;
    icon?: string;
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
          </div>
        </label>
      ))}
    </div>
  );
};
