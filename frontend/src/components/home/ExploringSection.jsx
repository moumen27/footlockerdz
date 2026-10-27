import React from 'react';

export default function ExploringSection() {
  return (
    <div className="exploring-section py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors">
      <div className="exploring-wrapper">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="explore-all grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Left Box */}
            <div className="explore-frame relative bg-[#f3f4f6] dark:bg-gray-800 rounded-2xl overflow-hidden group min-h-[400px] lg:min-h-[500px]">
              <img 
                src="https://cdn.prod.website-files.com/6890fbf29f28b7089b169c21/689f6dcb52275b4d9821578c_Explore-Left_frame.png" 
                alt="explore formal shoes" 
                className="explore-all-left-image absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute top-6 left-6 lg:top-8 lg:left-8 discount-tag bg-white/90 dark:bg-black/90 dark:text-white backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold shadow-sm z-10">
                20% OFF
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
              <div className="absolute bottom-6 left-6 right-6 lg:bottom-10 lg:left-10 lg:right-10 flex justify-between items-end z-10">
                <h2 className="text-3xl lg:text-4xl font-bold text-white max-w-[250px] leading-tight">Explore All Formal Shoes</h2>
                <a href="/category/formal" className="bg-white text-black p-4 rounded-full hover:bg-gray-100 transition-all hover:scale-110">
                   <img src="https://cdn.prod.website-files.com/6890fbf29f28b7089b169c21/6891eb6419cbb2dbff8f2725_right-arrow-icon.svg" alt="right arrow" className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Right Box */}
            <div className="explore-frame relative bg-[#f3f4f6] dark:bg-gray-800 rounded-2xl overflow-hidden group min-h-[400px] lg:min-h-[500px]">
              <img 
                src="https://cdn.prod.website-files.com/6890fbf29f28b7089b169c21/689f6dcb3e0d08d8984287ad_Explore-Right-Frame.png" 
                alt="explore running shoes" 
                className="explore-all-right-image absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute top-6 left-6 lg:top-8 lg:left-8 discount-tag bg-white/90 dark:bg-black/90 dark:text-white backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold shadow-sm z-10">
                25% OFF
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
              <div className="absolute bottom-6 left-6 right-6 lg:bottom-10 lg:left-10 lg:right-10 flex justify-between items-end z-10">
                <h2 className="text-3xl lg:text-4xl font-bold text-white max-w-[250px] leading-tight">Grab The Latest Running Shoes</h2>
                <a href="/category/running" className="bg-white text-black p-4 rounded-full hover:bg-gray-100 transition-all hover:scale-110">
                   <img src="https://cdn.prod.website-files.com/6890fbf29f28b7089b169c21/6891eb6419cbb2dbff8f2725_right-arrow-icon.svg" alt="right arrow" className="w-6 h-6" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
