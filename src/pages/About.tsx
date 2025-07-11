import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { MobileNavbar } from '@/components/MobileNavbar';

const About = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('about');

  const handleMenuItemClick = (item: string) => {
    setActiveMenuItem(item);
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] overflow-hidden">
      <Sidebar 
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
      />
      
      <MobileNavbar 
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
      />
      
      {/* Main content with responsive margins and mobile bottom padding */}
      <main className="md:ml-[270px] flex-1 px-5 pt-8 pb-8 md:pb-8 pb-24 overflow-hidden flex-col justify-start items-start gap-[52px] flex">
        <div className="w-full max-w-4xl flex-col justify-start items-start gap-8 flex">
          {/* Header */}
          <header className="w-full justify-start items-center gap-6 inline-flex">
            <h1 className="text-white text-[32px] font-semibold font-geist">
              About
            </h1>
          </header>
          
          {/* Content */}
          <section className="w-full flex-col justify-start items-start gap-6 flex">
            <motion.div 
              className="bg-[#171717] rounded-[18px] p-8 w-full"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-white text-xl font-semibold font-geist mb-4">
                Wallpaper Collection
              </h2>
              <p className="text-[#EDEDED] text-base leading-relaxed mb-4 font-geist">
                Our curated wallpaper collection features high-quality images across three categories:
              </p>
              <ul className="text-[#EDEDED] text-base leading-relaxed space-y-2 ml-6 font-geist">
                <li className="list-disc">
                  <strong>Mobile Wallpapers</strong> - Optimized at 1:2 aspect ratio for phone screens
                </li>
                <li className="list-disc">
                  <strong>Desktop Wallpapers</strong> - Beautiful 16:9 widescreen backgrounds
                </li>
                <li className="list-disc">
                  <strong>Profile Pictures</strong> - Perfect 1:1 square images for social media
                </li>
              </ul>
            </motion.div>

            <motion.div 
              className="bg-[#171717] rounded-[18px] p-8 w-full"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-white text-xl font-semibold font-geist mb-4">
                Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-[#EDEDED]">
                  <h3 className="font-semibold mb-2 font-geist">🎨 Responsive Design</h3>
                  <p className="text-sm font-geist">
                    Adaptive grid layout that works beautifully on all screen sizes
                  </p>
                </div>
                <div className="text-[#EDEDED]">
                  <h3 className="font-semibold mb-2 font-geist">⚡ Smooth Animations</h3>
                  <p className="text-sm font-geist">
                    Powered by Framer Motion for buttery smooth interactions
                  </p>
                </div>
                <div className="text-[#EDEDED]">
                  <h3 className="font-semibold mb-2 font-geist">📱 One-Click Downloads</h3>
                  <p className="text-sm font-geist">
                    Instant wallpaper downloads in optimized resolutions
                  </p>
                </div>
                <div className="text-[#EDEDED]">
                  <h3 className="font-semibold mb-2 font-geist">🔥 Hot Picks</h3>
                  <p className="text-sm font-geist">
                    Trending wallpapers marked with special badges
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-[#171717] rounded-[18px] p-8 w-full"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-white text-xl font-semibold font-geist mb-4">
                Technology Stack
              </h2>
              <div className="flex flex-wrap gap-3">
                {[
                  'React + TypeScript',
                  'Framer Motion',
                  'Tailwind CSS',
                  'Vite',
                  'Airtable API',
                  'Solar Icons'
                ].map((tech, index) => (
                  <motion.span
                    key={tech}
                    className="bg-[#0A0A0A] text-[#EDEDED] px-3 py-1 rounded-full text-sm font-geist"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;