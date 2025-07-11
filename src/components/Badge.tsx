import React from 'react';

interface BadgeProps {
  text: string;
  variant?: 'hot' | 'new' | 'featured';
}

export const Badge: React.FC<BadgeProps> = ({ text, variant = 'hot' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'hot':
        return 'bg-[#C8102E]';
      case 'new':
        return 'bg-blue-600';
      case 'featured':
        return 'bg-purple-600';
      default:
        return 'bg-[#C8102E]';
    }
  };

  return (
    <div className={`inline-flex h-5 px-1.5 py-0 ${getVariantStyles()} overflow-hidden rounded-[32px] justify-center items-center gap-0.5`}>
      <div className="w-3 h-3 relative overflow-hidden">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.5 9.72C7.979 10.5875 6.416 10.9005 6 10.9005C5.584 10.9005 4.021 10.5875 3.5 9.72C3.0905 9.17303 3.177 8.75853 3.412 8.48553C3.6195 8.24453 3.707 7.89203 3.707 7.66703V7.37203C3.707 7.19453 3.8855 7.07703 4.0385 7.16703C4.6065 7.50453 5.354 8.19703 5.354 9.22203C5.354 10.532 4.2985 10.937 3.6455 10.9925C3.7295 10.9975 3.81017 11 3.8875 11C5.2095 11 7.854 10.1105 7.854 6.55503C7.854 5.16503 7.1235 4.23003 6.424 3.69753C6.035 3.40053 5.539 3.69603 5.489 4.18303L5.446 4.60203C5.394 5.11203 4.929 5.53053 4.499 5.25103C3.657 4.70353 3.354 3.38753 3.354 2.66653V1.75253C3.354 1.39503 2.9925 1.15853 2.683 1.33853C1.2905 2.14803 -0.646 3.91003 -0.646 6.55553C-0.646 9.46303 1.375 10.5875 2.938 10.9005" fill="white"/>
        </svg>
      </div>
      <span className="text-white text-center text-[11px] font-normal font-britti">
        {text}
      </span>
    </div>
  );
};
