import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

interface MobileNavbarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({ activeItem, onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    {
      id: 'wallpapers',
      label: 'Wallpapers',
      path: '/',
      iconActive: 'solar:album-bold',
      iconInactive: 'solar:album-linear'
    },
    {
      id: 'about',
      label: 'About',
      path: '/about',
      iconActive: 'solar:buildings-bold',
      iconInactive: 'solar:buildings-linear'
    }
  ];
  
  const handleItemClick = (item: any) => {
    navigate(item.path);
    onItemClick(item.id);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#171717] border-t border-[#333] lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex justify-around items-center h-16 px-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-lg transition-colors ${
                isActive ? 'bg-[#0A0A0A]' : 'hover:bg-[#0A0A0A]/50'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`${isActive ? 'text-white' : 'text-[#737373]'}`}>
                <Icon 
                  icon={isActive ? item.iconActive : item.iconInactive} 
                  width={24} 
                  height={24} 
                />
              </div>
              <span className={`text-xs font-medium font-geist ${
                isActive ? 'text-white' : 'text-[#737373]'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}; 