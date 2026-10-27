import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';
import geoData from '../../data/algeria-cities.json';
import { Check, Truck, CreditCard, User as UserIcon, ShoppingBag, ArrowRight, ArrowLeft, Package } from 'lucide-react';

const wilayas = geoData.wilayas;
const allCommunes = geoData.communes;

const STEPS = [
  { id: 1, title: 'Identification', icon: UserIcon },
  { id: 2, title: 'Livraison', icon: Truck },
  { id: 3, title: 'Paiement', icon: CreditCard },
  { id: 4, title: 'Confirmation', icon: Check }
];

const CheckoutPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, subtotal, clearCart, freeShippingThreshold, settings } = useCart();
  const { isAr } = useLanguage();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [contactInfo, setContactInfo] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [shippingMethod, setShippingMethod] = useState('home'); // home or desk
  const [shippingAddress, setShippingAddress] = useState({
    wilayaCode: '01',
    commune: '',
    address: '',
    phone: user?.phone || '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  // Dynamic shipping cost computation
  let homePrice = 600;
  let deskPrice = 400;
  if (settings?.shippingRates) {
    const rate = settings.shippingRates.find(r => r.wilayaCode === shippingAddress.wilayaCode);
    if (rate) {
      homePrice = rate.homePrice;
      deskPrice = rate.deskPrice;
    }
  }

  const baseShippingCost = shippingMethod === 'home' ? homePrice : deskPrice;
  const shippingCost = (subtotal || 0) >= freeShippingThreshold ? 0 : baseShippingCost;
  const totalAmount = (subtotal || 0) + shippingCost;

  useEffect(() => {
    if (cartItems.length === 0) {
      toast.info('Votre panier est vide');
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Handle pre-filling address if user is logged in and has default address
  useEffect(() => {
    if (isAuthenticated && user?.addresses?.length > 0 && currentStep === 2) {
      const defaultAddr = user.addresses.find(a => a._id === user.defaultAddressId) || user.addresses[0];
      setShippingAddress({
        wilayaCode: defaultAddr.wilayaCode,
        commune: defaultAddr.commune,
        address: defaultAddr.street,
        phone: defaultAddr.phone
      });
    }
  }, [isAuthenticated, user, currentStep]);

  const handleNext = () => {
    // Validation
    if (currentStep === 1) {
      if (!isAuthenticated && (!contactInfo.email || !contactInfo.phone)) {
        toast.error('Veuillez renseigner votre email et téléphone');
        return;
      }
    } else if (currentStep === 2) {
      if (!shippingAddress.wilayaCode || !shippingAddress.commune || !shippingAddress.address || !shippingAddress.phone) {
        toast.error('Veuillez remplir tous les champs de livraison');
        return;
      }
    }

    window.scrollTo(0, 0);
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    window.scrollTo(0, 0);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    
    // Format items as snapshot
    const itemsSnapshot = cartItems.map(item => ({
      name: typeof item.name === 'object' ? item.name.fr : item.name,
      qty: item.quantity,
      image: item.image,
      price: item.price,
      productId: item.id,
      variant: {
        color: item.color,
        size: item.size
      }
    }));

    const orderData = {
      guestEmail: isAuthenticated ? undefined : contactInfo.email,
      guestPhone: isAuthenticated ? undefined : contactInfo.phone,
      items: itemsSnapshot,
      amounts: {
        subtotal: subtotal || 0,
        shipping: shippingCost,
        discount: 0,
        total: totalAmount
      },
      shipping: {
        wilaya: shippingAddress.wilayaCode,
        commune: shippingAddress.commune,
        address: shippingAddress.address,
        phone: shippingAddress.phone,
        method: shippingMethod
      },
      payment: {
        method: paymentMethod,
        status: 'pending'
      }
    };

    try {
      const response = await axiosInstance.post('/orders', orderData);
      
      // Order created successfully, we can clear the cart safely now
      clearCart();

      if (paymentMethod === 'stripe') {
        // Redirect to Stripe Checkout
        try {
          const stripeRes = await axiosInstance.post('/stripe/create-checkout-session', {
            orderId: response.data._id
          });
          window.location.href = stripeRes.data.url;
          return; // Stop here, user will be redirected
        } catch (stripeError) {
          toast.error("La commande est enregistrée, mais le paiement Stripe a échoué.");
          if (isAuthenticated) navigate(`/account/orders/${response.data.number}`);
          else navigate('/');
          return;
        }
      }

      toast.success('Commande validée avec succès !');
      // Redirect based on auth
      if (isAuthenticated) {
        navigate(`/account/orders/${response.data.number}`);
      } else {
        toast.success(`Votre numéro de commande est le ${response.data.number}`);
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la validation de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Validation de la commande</h1>
        
        {/* Stepper */}
        <div className="flex justify-between items-center mb-12 max-w-3xl mx-auto relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-[#F9A826] -z-10 transition-all duration-500" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}></div>
          
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300
                  ${isActive ? 'bg-[#F9A826] border-orange-100 text-white' : 
                    isCompleted ? 'bg-[#F9A826] border-[#F9A826] text-white' : 'bg-white border-gray-200 text-gray-400'}`}
                >
                  <Icon size={20} />
                </div>
                <span className={`mt-2 text-sm font-semibold ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="lg:w-2/3">
            <div className="bg-white p-8 border border-gray-200 shadow-sm">
              
              {/* STEP 1: Identification */}
              {currentStep === 1 && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">1. Identification</h2>
                  
                  {isAuthenticated ? (
                    <div className="bg-green-50 border border-green-200 p-6 rounded-md mb-6 text-center">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserIcon size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Connecté en tant que {user?.firstName} {user?.lastName}</h3>
                      <p className="text-gray-600 mt-2">{user?.email}</p>
                      <p className="text-gray-500 text-sm mt-4">Vous pouvez passer à l'étape suivante.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-orange-50 border border-orange-100 p-6 rounded-md mb-6">
                        <p className="text-gray-800 font-medium text-center">Vous commandez en tant qu'invité.</p>
                        <p className="text-center text-sm text-gray-600 mt-2">
                          <Link to="/auth" className="text-[#F9A826] font-bold hover:underline">Connectez-vous</Link> pour suivre vos commandes.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Email *</label>
                          <input 
                            type="email" 
                            value={contactInfo.email}
                            onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                            placeholder="votre@email.com"
                            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[#F9A826]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Téléphone *</label>
                          <input 
                            type="tel" 
                            value={contactInfo.phone}
                            onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                            placeholder="05 55 55 55 55"
                            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[#F9A826]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleNext} className="bg-[#11323B] text-white px-8 py-3 font-medium hover:bg-gray-800 flex items-center gap-2">
                      Continuer <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Livraison */}
              {currentStep === 2 && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">2. Options de Livraison</h2>
                  
                  {/* Méthode de livraison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <label className={`border-2 p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${shippingMethod === 'home' ? 'border-[#F9A826] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="shippingMethod" value="home" checked={shippingMethod === 'home'} onChange={() => setShippingMethod('home')} className="hidden" />
                      <Truck size={32} className={shippingMethod === 'home' ? 'text-[#F9A826]' : 'text-gray-400'} />
                      <span className="font-bold text-gray-900">Livraison à domicile</span>
                      <span className="text-sm text-gray-500">{(subtotal || 0) >= freeShippingThreshold ? <span className="text-green-600 font-semibold">Gratuit</span> : `${homePrice} DZD`}</span>
                    </label>
                    <label className={`border-2 p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${shippingMethod === 'desk' ? 'border-[#F9A826] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="shippingMethod" value="desk" checked={shippingMethod === 'desk'} onChange={() => setShippingMethod('desk')} className="hidden" />
                      <Package size={32} className={shippingMethod === 'desk' ? 'text-[#F9A826]' : 'text-gray-400'} />
                      <span className="font-bold text-gray-900">Point Relais (Desk)</span>
                      <span className="text-sm text-gray-500">{(subtotal || 0) >= freeShippingThreshold ? <span className="text-green-600 font-semibold">Gratuit</span> : `${deskPrice} DZD`}</span>
                    </label>
                  </div>

                  {/* Formulaire d'adresse */}
                  <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Adresse de livraison</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Wilaya *</label>
                        <select 
                          value={shippingAddress.wilayaCode}
                          onChange={(e) => setShippingAddress({...shippingAddress, wilayaCode: e.target.value, commune: ''})}
                          className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[#F9A826]"
                        >
                          {wilayas.map(w => (
                            <option key={w.code} value={w.code}>{w.code} - {w.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Commune *</label>
                        <select 
                          value={shippingAddress.commune}
                          onChange={(e) => setShippingAddress({...shippingAddress, commune: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[#F9A826]"
                        >
                          <option value="" disabled>Sélectionnez une commune</option>
                          {allCommunes.filter(c => c.wilayaCode === shippingAddress.wilayaCode).map((c, i) => (
                            <option key={i} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Adresse détaillée (Cité, Rue, N°) *</label>
                      <input 
                        type="text" 
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                        placeholder="Ex: Cité 200 logements, Bâtiment B..."
                        className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[#F9A826]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Téléphone (à contacter pour la livraison) *</label>
                      <input 
                        type="tel" 
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[#F9A826]"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button onClick={handlePrev} className="text-gray-600 font-medium hover:text-gray-900 flex items-center gap-2">
                      <ArrowLeft size={18} /> Retour
                    </button>
                    <button onClick={handleNext} className="bg-[#11323B] text-white px-8 py-3 font-medium hover:bg-gray-800 flex items-center gap-2">
                      Continuer <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Paiement */}
              {currentStep === 3 && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">3. Mode de Paiement</h2>
                  
                  <div className="space-y-4">
                    <label className={`border p-6 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#F9A826] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-[#F9A826]" />
                      <div className="flex-1">
                        <span className="font-bold text-gray-900 block text-lg">Paiement à la livraison (COD)</span>
                        <span className="text-gray-500 text-sm block">Payez en espèces lorsque vous recevez votre commande.</span>
                      </div>
                    </label>
                    
                    <label className={`border p-6 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'ccp' ? 'border-[#F9A826] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value="ccp" checked={paymentMethod === 'ccp'} onChange={() => setPaymentMethod('ccp')} className="w-5 h-5 text-[#F9A826]" />
                      <div className="flex-1">
                        <span className="font-bold text-gray-900 block text-lg">Virement CCP</span>
                        <span className="text-gray-500 text-sm block">Virement bancaire vers notre compte CCP. (Traitement plus long)</span>
                      </div>
                    </label>

                    <label className={`border p-6 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-[#F9A826] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} className="w-5 h-5 text-[#F9A826]" />
                      <div className="flex-1">
                        <span className="font-bold text-gray-900 block text-lg">Carte Bancaire (Stripe)</span>
                        <span className="text-gray-500 text-sm block">Paiement sécurisé par carte bancaire.</span>
                      </div>
                    </label>

                    <label className={`border p-6 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'baridimob' ? 'border-[#F9A826] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value="baridimob" checked={paymentMethod === 'baridimob'} onChange={() => setPaymentMethod('baridimob')} className="w-5 h-5 text-[#F9A826]" />
                      <div className="flex-1">
                        <span className="font-bold text-gray-900 block text-lg">BaridiMob</span>
                        <span className="text-gray-500 text-sm block">Paiement instantané via l'application BaridiMob.</span>
                      </div>
                    </label>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button onClick={handlePrev} className="text-gray-600 font-medium hover:text-gray-900 flex items-center gap-2">
                      <ArrowLeft size={18} /> Retour
                    </button>
                    <button onClick={handleNext} className="bg-[#11323B] text-white px-8 py-3 font-medium hover:bg-gray-800 flex items-center gap-2">
                      Continuer <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Confirmation */}
              {currentStep === 4 && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">4. Confirmation de la commande</h2>
                  
                  <div className="bg-gray-50 p-6 border border-gray-200 mb-6 space-y-4">
                    <div className="flex justify-between border-b pb-4">
                      <div>
                        <p className="font-semibold text-gray-500 text-sm uppercase tracking-wider mb-1">Livraison</p>
                        <p className="font-bold text-gray-900">{shippingMethod === 'home' ? 'À domicile' : 'Point Relais'}</p>
                        <p className="text-gray-600 mt-1">{shippingAddress.address}</p>
                        <p className="text-gray-600">{shippingAddress.commune}, Wilaya {shippingAddress.wilayaCode}</p>
                        <p className="text-gray-600 font-medium mt-1">{shippingAddress.phone}</p>
                      </div>
                      <button onClick={() => setCurrentStep(2)} className="text-[#F9A826] font-semibold text-sm hover:underline">Modifier</button>
                    </div>
                    
                    <div className="flex justify-between pt-2">
                      <div>
                        <p className="font-semibold text-gray-500 text-sm uppercase tracking-wider mb-1">Paiement</p>
                        <p className="font-bold text-gray-900 uppercase">{paymentMethod}</p>
                      </div>
                      <button onClick={() => setCurrentStep(3)} className="text-[#F9A826] font-semibold text-sm hover:underline">Modifier</button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-6 flex gap-4 items-start mb-8">
                    <Check className="text-yellow-600 shrink-0 mt-1" size={24} />
                    <div>
                      <h4 className="font-bold text-yellow-800 text-lg">Prêt à valider ?</h4>
                      <p className="text-yellow-700 mt-1">
                        En cliquant sur "Valider ma commande", vous acceptez de payer {totalAmount.toFixed(2)} DZD 
                        à la livraison (ou via la méthode choisie).
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button onClick={handlePrev} className="text-gray-600 font-medium hover:text-gray-900 flex items-center gap-2">
                      <ArrowLeft size={18} /> Retour
                    </button>
                    <button 
                      onClick={handlePlaceOrder} 
                      disabled={isSubmitting}
                      className="bg-green-600 text-white px-10 py-4 font-bold text-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {isSubmitting ? 'Validation...' : 'VALIDER MA COMMANDE'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar (Order Summary) */}
          <div className="lg:w-1/3">
            <div className="bg-white border border-gray-200 p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 font-bold text-xl mb-6 text-gray-900 pb-4 border-b">
                <ShoppingBag /> Résumé de la commande
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto mb-6 pr-2">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 border shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm line-clamp-2">
                        {typeof item.name === 'object' ? (isAr ? item.name.ar : item.name.fr) : item.name}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">Qté: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-gray-900 text-sm">
                      {(item.price * item.quantity).toFixed(2)} DZD
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-medium text-gray-900">{(subtotal || 0).toFixed(2)} DZD</span>
                </div>
                {currentStep >= 2 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Frais de livraison</span>
                    <span className="font-medium text-gray-900">{shippingCost === 0 ? <span className="text-green-600">Gratuit</span> : `${shippingCost.toFixed(2)} DZD`}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-2xl text-[#F9A826]">{totalAmount.toFixed(2)} DZD</span>
                </div>
                <p className="text-right text-xs text-gray-500 mt-1">Taxes incluses</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
