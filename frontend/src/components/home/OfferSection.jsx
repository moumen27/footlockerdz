import React from 'react';

export default function OfferSection() {
  return (
    <div className="offer-section py-16 lg:py-24">
      <div className="section-spacing">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="relative rounded-3xl overflow-hidden bg-[#0c0407] text-white min-h-[300px] lg:min-h-[400px] flex items-center justify-center p-8 lg:p-16">
            
            {/* Background Image Setup */}
            <div className="absolute inset-0 z-0">
              {/* Using a placeholder background gradient to emulate the Webflow image slider */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black mix-blend-multiply"></div>
              <img 
                src="https://cdn.prod.website-files.com/6890fbf29f28b7089b169c21/689f6c65381608ffd59aca70_Offer-Frame-one.png" 
                alt="offer background" 
                className="w-full h-full object-cover opacity-50"
              />
            </div>

            <div className="offer-content-wrap relative z-10 text-center flex flex-col items-center">
              <div className="offer-tag bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase mb-6">
                Weekend Offer
              </div>
              <h2 className="discount-percentage text-6xl lg:text-8xl font-black mb-4">
                20% OFF!
              </h2>
              <p className="offer-details text-lg lg:text-xl text-gray-300 max-w-lg mx-auto">
                Summit Sneakers! Hottest Deals Of The Month
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
