import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import logolight from '../../assets/icons/logo-light.jpg';
import logodark from '../../assets/icons/logo-dark.jpg';
import HeaderTopBar from './HeaderTopBar';
import MegaMenu from './MegaMenu';
import SearchBar from './SearchBar';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Header() {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeMegaMenuGender, setActiveMegaMenuGender] = useState(null);
  const [activeMegaMenuType, setActiveMegaMenuType] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { t } = useLanguage();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount: favoritesCount } = useWishlist();

  const handleMegaMenuEnter = (type, gender) => {
    setIsMegaMenuOpen(true);
    if (type) setActiveMegaMenuType(type);
    if (gender) setActiveMegaMenuGender(gender);
  };
  const handleMegaMenuLeave = () => setIsMegaMenuOpen(false);

  const navLinks = [
    { name: t({fr: 'Homme', ar: 'رجال'}), path: '/shop?gender=men', hasMegaMenu: true, type: 'gender' },
    { name: t({fr: 'Femme', ar: 'نساء'}), path: '/shop?gender=women', hasMegaMenu: true, type: 'gender' },
    { name: t({fr: 'Enfant', ar: 'أطفال'}), path: '/shop?gender=kids', hasMegaMenu: true, type: 'gender' },
    { name: t({fr: 'Marques', ar: 'ماركات'}), path: '/brands', hasMegaMenu: false, type: 'brands' },
    { name: t({fr: 'Soldes', ar: 'تخفيضات'}), path: '/sale', hasMegaMenu: false },
    { name: t({fr: 'Nouveautés', ar: 'جديدنا'}), path: '/new', hasMegaMenu: false },
  ];

  return (
    <header className="relative w-full z-50 transition-colors duration-300 bg-white dark:bg-gray-900 shadow-[0_2px_5px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
      {/* Top Utility Bar */}
      <HeaderTopBar />

      {/* Main Navigation Bar */}
      <div className="relative border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="inline-block" aria-label="Accueil">
                {/* Light Mode Logo */}
                <img
                  src={logolight}
                  className="h-10 md:h-12 scale-[1.5] md:scale-[2.1] px-4 md:px-8 block dark:hidden"
                  alt="Footlocker Logo"
                />
                {/* Dark Mode Logo */}
                <img
                  src={logodark}
                  className="h-10 md:h-12 scale-[1.5] md:scale-[2.1] px-4 md:px-8 hidden dark:block"
                  alt="Footlocker Logo"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 h-full">
              {navLinks.map((link) => (
                <div 
                  key={link.name} 
                  className="h-full flex items-center"
                  onMouseEnter={link.hasMegaMenu ? () => handleMegaMenuEnter(link.type, link.path.includes('gender=') ? link.path.split('gender=')[1] : null) : undefined}
                  onMouseLeave={link.hasMegaMenu ? handleMegaMenuLeave : undefined}
                >
                  <Link 
                    to={link.path} 
                    className="font-medium text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-2">
              <button 
                className="w-11 h-11 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Recherche"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                {isSearchOpen ? <X size={22} /> : <Search size={22} />}
              </button>

              <Link 
                to="/favorites"
                className="relative w-11 h-11 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Favoris"
              >
                <Heart size={22} />
                {favoritesCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              <button 
                className="relative w-11 h-11 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Panier"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                className="lg:hidden w-11 h-11 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white ml-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        <div 
          onMouseEnter={() => handleMegaMenuEnter(activeMegaMenuType, activeMegaMenuGender)}
          onMouseLeave={handleMegaMenuLeave}
        >
          <MegaMenu isOpen={isMegaMenuOpen} activeGender={activeMegaMenuGender} activeType={activeMegaMenuType} />
        </div>

        {/* Search Bar Dropdown */}
        <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </div>

      {/* Mobile Menu Content (Basic implementation) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-3 text-base font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
