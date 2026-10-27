import React from 'react';
import { Instagram } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../../api/settingsApi';
import { useLanguage } from '../../context/LanguageContext';

const instagramImages = [
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1514989940723-e8e51635b782?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
];

export default function InstagramSection() {
  const { t } = useLanguage();
  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
    staleTime: 60 * 1000
  });

  const instagramUrl = settingsData?.socials?.instagram || 'https://www.instagram.com';

  return (
    <div className="bg-[#fcfcfc] dark:bg-gray-900 transition-colors">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {instagramImages.map((img, index) => (
          <a 
            href={instagramUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            key={index} 
            aria-label={t({
              fr: `Voir notre compte Instagram officiel FootLockerDZ (ouvre dans un nouvel onglet)`,
              ar: `زيارة حسابنا الرسمي على إنستغرام FootLockerDZ (يفتح في تبويب جديد)`
            })}
            className="relative group aspect-square overflow-hidden cursor-pointer block focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:z-10"
          >
            <img 
              src={img} 
              alt={t({
                fr: `Publication Instagram ${index + 1} de la collection sneakers`,
                ar: `منشور إنستغرام ${index + 1} لمجموعة السنيكرز`
              })}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
              <Instagram className="text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 w-10 h-10" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
