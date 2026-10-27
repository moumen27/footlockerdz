import React from 'react';

const features = [
  {
    icon: "https://cdn.prod.website-files.com/6890fbf29f28b7089b169c21/6892144f750bf17c33b635e7_recycling-reproducing-svgrepo-com%201.svg",
    title: "Sustainable Materials",
    description: "We believe great style shouldn’t come at the planet’s expense."
  },
  {
    icon: "https://cdn.prod.website-files.com/6890fbf29f28b7089b169c21/689214509e45233c0eac2f63_warranty-svgrepo-com%201.svg",
    title: "Warranty Included",
    description: "Every pair comes with a hassle-free 6-month warranty"
  },
  {
    icon: "https://cdn.prod.website-files.com/6890fbf29f28b7089b169c21/68921450b524ed88c4868689_delivery-fast-svgrepo.svg",
    title: "Delivery & Shipping",
    description: "Your shoes will be dispatched within 1–2 business days"
  },
  {
    icon: "https://cdn.prod.website-files.com/6890fbf29f28b7089b169c21/6892144f566712d4d864a312_eco-friendly-svgrepo-com%201.svg",
    title: "Eco-Friendly Fabrics",
    description: "Crafted with sustainability in mind, our shoes feature eco-friendly fabrics"
  }
];

export default function FeatureSection() {
  return (
    <div className="feature-section py-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="feature-wrapper">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="feature-box-wrapper grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div key={index} className="feature-box flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-6">
                  <img src={feature.icon} loading="lazy" alt="" className="feature-image w-8 h-8 dark:invert" />
                </div>
                <h2 className="feature-title-text font-bold text-lg mb-3 text-gray-900 dark:text-white">{feature.title}</h2>
                <p className="feature-paragraph text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
