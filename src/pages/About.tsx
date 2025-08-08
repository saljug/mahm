import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Sidebar } from '@/components/Sidebar';
import { MobileNavbar } from '@/components/MobileNavbar';

const About = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('about');

  const handleMenuItemClick = (item: string) => {
    setActiveMenuItem(item);
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:hi@mahmformula.com';
  };

  const stats = [
    {
      icon: 'solar:users-group-rounded-bold',
      number: '22K+',
      label: 'Instagram Followers',
      description: 'Growing community of F1 enthusiasts'
    },
    {
      icon: 'solar:eye-bold',
      number: '30M+',
      label: 'Instagram Views',
      description: 'Massive reach across social platforms'
    },
    {
      icon: 'solar:gallery-bold',
      number: '100+',
      label: 'Premium Wallpapers',
      description: 'High-quality F1 content library'
    }
  ];

  const services = [
    {
      icon: 'solar:medal-ribbons-star-bold',
      title: 'Brand Partnerships',
      description: 'Partner with us for authentic F1 content creation and brand integration that resonates with motorsport fans worldwide.'
    },
    {
      icon: 'solar:presentation-graph-bold',
      title: 'Digital Advertising',
      description: 'Reach our engaged audience of 30M+ viewers through targeted advertising campaigns and sponsored content across our platforms.'
    },
    {
      icon: 'solar:camera-bold',
      title: 'Content Creation',
      description: 'Custom F1 memes, news content, graphics, and premium wallpapers tailored to your brand and marketing objectives.'
    },
    {
      icon: 'solar:rocket-bold',
      title: 'Social Media Marketing',
      description: 'Leverage our 22K+ Instagram following and viral content expertise for product launches and brand awareness campaigns.'
    }
  ];

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
      <main className="lg:ml-[270px] flex-1 px-5 pt-8 pb-24 lg:pb-8 overflow-hidden flex-col justify-start items-start gap-12 flex">
        <div className="w-full max-w-6xl flex-col justify-start items-start gap-12 flex">
          
          {/* Header */}
          <header className="w-full justify-start items-center gap-6 inline-flex">
            <h1 className="text-white text-[32px] font-semibold">
              About Mahm Formula
            </h1>
          </header>
          
          {/* Hero Section */}
          <motion.section 
            className="w-full bg-gradient-to-br from-[#171717] to-[#0A0A0A] rounded-[22px] p-6 lg:p-12 border border-[#333]/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-8">
              <div className="flex-1">
                <motion.div 
                  className="flex items-center gap-3 mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h2 className="text-white text-2xl lg:text-3xl font-bold">
                    The Premium F1 Experience
                  </h2>
                </motion.div>
                
                <motion.p 
                  className="text-[#EDEDED] text-lg lg:text-xl leading-relaxed mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Mahm Formula is your go-to destination for F1 content creation, news, memes, and community engagement. 
                  We bring the excitement of Formula 1 to life through viral content, breaking news, and premium digital assets.
                </motion.p>
                
                <motion.p 
                  className="text-[#BABABA] text-base lg:text-lg leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  From hilarious F1 memes to breaking news coverage and premium wallpapers, we've built a thriving community 
                  of motorsport fans with millions of views and thousands of engaged followers.
                </motion.p>
              </div>
              
              <motion.div 
                className="w-full xl:w-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className="w-64 h-64 bg-gradient-to-br from-[#C8102E] to-[#8B0000] rounded-2xl flex items-center justify-center mx-auto xl:mx-0 p-8">
                  <img 
                    src="/logo.svg" 
                    alt="Mahm Formula Logo" 
                    className="w-full h-full object-contain filter brightness-0 invert"
                  />
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Stats Section */}
          <section className="w-full">
            <motion.h2 
              className="text-white text-2xl font-bold mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Our Impact in Numbers
            </motion.h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-[#171717] rounded-[18px] p-6 text-center border border-[#333]/30 hover:border-[#C8102E]/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="w-16 h-16 bg-[#C8102E]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon icon={stat.icon} width={32} height={32} className="text-[#C8102E]" />
                  </div>
                  <div className="text-white text-3xl font-bold mb-2">{stat.number}</div>
                  <div className="text-[#EDEDED] font-semibold mb-2">{stat.label}</div>
                  <div className="text-[#BABABA] text-sm">{stat.description}</div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Services Section */}
          <section className="w-full">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-white text-3xl font-bold mb-4">
                Partner With Us
              </h2>
              <p className="text-[#BABABA] text-lg max-w-3xl mx-auto">
                Ready to accelerate your brand's presence in the F1 community? 
                Let's create something extraordinary together.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  className="bg-[#171717] rounded-[20px] p-8 border border-[#333]/30 hover:border-[#C8102E]/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#C8102E]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon icon={service.icon} width={28} height={28} className="text-[#C8102E]" />
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-bold mb-3">{service.title}</h3>
                      <p className="text-[#BABABA] leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Contact CTA Section */}
          <motion.section 
            className="w-full bg-gradient-to-r from-[#C8102E] to-[#8B0000] rounded-[22px] p-6 lg:p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="max-w-3xl mx-auto">
              <h2 className="text-white text-3xl lg:text-4xl font-bold mb-4">
                Ready to Race Forward?
              </h2>
              <p className="text-white/90 text-lg lg:text-xl mb-8">
                Whether you're looking for brand partnerships, advertising opportunities, or custom content creation, 
                we're here to help your brand cross the finish line first.
              </p>
              
              <motion.button
                onClick={handleEmailClick}
                className="inline-flex items-center gap-3 bg-white text-[#C8102E] px-8 py-4 rounded-[18px] font-bold text-lg hover:bg-white/90 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon icon="solar:letter-bold" width={24} height={24} />
                Get in Touch - hi@mahmformula.com
              </motion.button>
              
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:clock-circle-bold" width={20} height={20} />
                  <span>Usually respond within 24 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:shield-check-bold" width={20} height={20} />
                  <span>Professional partnerships only</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Compact Terms of Use Section */}
          <div className="w-full max-w-4xl mx-auto mt-8 text-sm text-[#888] text-center leading-relaxed px-2 pb-8">
            <Icon icon="solar:shield-check-linear" width={16} height={16} className="inline align-text-bottom mr-1" />
            <span>
              Many wallpapers on this site are original edits by Mahm Formula, but some use images found on the internet (including Pinterest) as a base. Logos and trademarks used in wallpapers (such as F1 team logos, sponsors, etc.) are the property of their respective owners; we do not claim copyright or endorsement for these elements, and they are used for creative/fan purposes only. We do not claim copyright on the underlying photos, only on our edits and compositions. Please do not resell, redistribute, or claim these wallpapers as your own. Sharing is welcome, but always credit @mahmformula. If you are a copyright holder and wish for an image to be removed, please contact <a href="mailto:hi@mahmformula.com" className="text-[#C8102E] hover:underline">hi@mahmformula.com</a>&nbsp;and we will promptly comply.
            </span>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default About;