import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick }) => {
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
      className="fixed left-0 top-0 hidden md:flex w-[270px] h-screen flex-col items-start gap-2.5 shrink-0 p-2.5 overflow-hidden z-50 bg-[#0A0A0A]" 
      aria-label="Main navigation"
    >
      <div className="flex flex-col items-start self-stretch">
        {/* Logo Header */}
        <header className="self-stretch h-[120px] px-[14px] pt-[34px] pb-[34px] overflow-hidden flex flex-col justify-center items-start gap-2.5">
          <img 
            src="/logo.png" 
            alt="Mahm Logo" 
            className="w-auto h-[44px] object-contain"
          />
        </header>
        
        {/* Navigation Menu */}
        <div className="flex flex-col items-start gap-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex w-[250px] items-center gap-4 px-[14px] py-3 rounded-[18px] transition-colors overflow-hidden ${
                  isActive ? 'bg-[#171717]' : 'hover:bg-[#171717]/50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-[#737373]'}`}>
                  <Icon 
                    icon={isActive ? item.iconActive : item.iconInactive} 
                    width={28} 
                    height={28} 
                  />
                </div>
                <span className={`text-center text-base font-semibold font-geist ${
                  isActive ? 'text-white' : 'text-[#737373]'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
