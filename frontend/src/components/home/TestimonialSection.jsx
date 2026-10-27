import React from 'react';
import { testimonials } from '../../data/homeData';

export default function TestimonialSection() {
  return (
    <div className="testimonial-section py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors">
      <div className="section-spacing">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="common-left-title mb-12">
            <h2 className="section-heading-text testimonial-title text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">What People Says</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="first-feedback flex flex-col md:flex-row gap-8 bg-[#fcfcfc] dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="feedback-image w-full md:w-1/3 shrink-0">
                  <img 
                    src={testimonial.productImage} 
                    alt="product" 
                    className="testimonial-image w-full h-auto aspect-square object-cover rounded-xl" 
                  />
                </div>
                <div className="feedback-content flex flex-col justify-between py-2">
                  <p className="feedback-text text-gray-600 dark:text-gray-300 text-lg leading-relaxed italic mb-6">
                    {testimonial.text}
                  </p>
                  <div className="feedback-person-rating flex items-center gap-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="img-testimonial w-12 h-12 rounded-full object-cover" 
                    />
                    <div className="person-name-rating">
                      <h3 className="common-small-title-text font-bold text-lg text-gray-900 dark:text-white">{testimonial.name}</h3>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <img 
                            key={star} 
                            src="https://cdn.prod.website-files.com/6890fbf29f28b7089b169c21/68a07e9e478c76ab436809ab_star-fill%20(1).svg" 
                            alt="star" 
                            className="w-4 h-4" 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
