import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Menu, X, Star, Plus, Minus, Trash2, ChevronRight, ChevronLeft,
  MapPin, Phone, Package, ShieldCheck, Truck, Instagram, Facebook, 
  ArrowLeft, MessageCircle, Info, Clock, Search, ExternalLink, 
  Users, ChefHat, Award, Heart, Quote, CheckCircle, Check
} from 'lucide-react';

// 1. Import Firebase functions
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

// --- CONFIGURATION ---
const SHIPPING_CHARGES = 40;
const PACKING_CHARGES = 10;
const BUSINESS_PHONE = "6281188024"; 
const INSTAGRAM_URL = "https://www.instagram.com/atreyapuram_pure_putharekulu?utm_source=qr&igsh=MWVjMXd4M3Z2NDVlcg==";
const FSSAI_LICENSE = "20125092000200";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase safely
let db = null;
try {
  if (typeof window !== 'undefined') {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (error) {
  console.error("Firebase init error:", error);
}

// --- DEFAULT COUPONS ---
const DEFAULT_COUPONS = {
  "WELCOME10": { type: 'percent', value: 10, minOrder: 500, isActive: true, expiryDate: "2030-12-31" },
  "FESTIVAL20": { type: 'percent', value: 20, minOrder: 1500, isActive: true, expiryDate: "2030-12-31" },
  "FLAT50": { type: 'flat', value: 50, minOrder: 1000, isActive: true, expiryDate: "2023-01-01" }
};

// --- MOCK DATA ---
const PRODUCTS = [
  {
    id: 1,
    name: "Bellam Putharekulu",
    teluguName: "బెల్లం పూతరేకులు",
    price: 99,
    originalPrice: 199,
    packSize: "Box of 5",
    category: "Best Seller",
    rating: 4.9,
    isBestSeller: true,
    // FIXED PATHS: Removed 'public', added leading slash
    images: [
      "/images/bellam5pieces.jpeg",
      "/images/bellam5pieces1.jpeg"
    ], 
    description: "Our signature box. Loaded with premium organic jaggery and pure ghee.",
    ingredients: "Rice Paper, Organic Jaggery, Ghee, Premium Dry Fruits.",
    shelfLife: "25 Days",
    gradient: "from-amber-50 to-orange-100",
  },
  {
    id: 2,
    name: "DryFruits Putharekulu",
    teluguName: " ",
    price: 249,
    originalPrice: 549,
    packSize: "Box of 10",
    category: "Sugar Free",
    rating: 5.0,
    isBestSeller: true,
    images: ["public/images/dryfruit.jpeg","public/images/dryfruit2.jpeg"], 
    description: "Our signature box. Loaded with premium cashews, almonds and organic jaggery and pure ghee.",
    ingredients: "Rice Paper, Dates, Honey, Dry Fruits, Ghee (No Jaggery/Sugar).",
    shelfLife: "30 Days",
    gradient: "from-orange-50 to-amber-100",
  },
  {
    id: 3,
    name: "Special DryFruit Putharekulu",
    teluguName: "",
    price: 449,
    originalPrice: 749,
    packSize: "10 Pieces",
    category: "Traditional",
    rating: 4.8,
    isBestSeller: true,
    images: ["public/images/sp_dryfruit.jpeg","public/images/sp_dryfruit1.jpeg"],
    description: "Our signature box. Loaded with premium cashews, almonds and pistachiosand  organic jaggery and pure ghee.",
    ingredients: "Real Mango Pulp, Sugar.",
    shelfLife: "6 Months",
    gradient: "from-yellow-50 to-orange-100",
  }
];

const TESTIMONIALS = [
  { name: "Priya Reddy", location: "Hyderabad", text: "The taste is exactly like what my grandmother used to make. The packaging ensured not a single piece was broken!" },
  { name: "Suresh K.", location: "Bangalore", text: "Ordered for my daughter's wedding. The 'Exotic Dates' variant was a hit among guests. Highly recommended." },
  { name: "Anita Roy", location: "Mumbai", text: "I was skeptical about shipping sweets, but the rigid box packing is genius. Fresh and crispy delivery." }
];

// --- COMPONENTS ---

const Button = ({ children, variant = 'primary', onClick, className = '', icon: Icon, disabled, type='button' }) => {
  const baseStyle = "px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5";
  const variants = {
    primary: "bg-gradient-to-r from-amber-700 to-amber-900 text-white border border-amber-800",
    secondary: "bg-white text-amber-900 border-2 border-amber-900 hover:bg-amber-50",
    outline: "border-2 border-amber-800 text-amber-900 hover:bg-amber-900 hover:text-white",
    whatsapp: "bg-gradient-to-r from-green-600 to-green-700 text-white"
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon className="w-5 h-5" />}
      <span>{children}</span>
    </button>
  );
};

const Features = () => (
  <div className="py-16 bg-amber-50 border-y border-amber-100/50">
    <div className="max-w-7xl mx-auto px-4 relative z-10">
      <div className="grid md:grid-cols-4 gap-8 text-center">
        {[
          { icon: Users, title: "Women Artisans", desc: "Handmade by local experts" }, 
          { icon: ChefHat, title: "Pure Ghee", desc: "Farm fresh A2 Ghee used" }, 
          { icon: Package, title: "Rigid Packing", desc: "Damage-proof delivery box" }, 
          { icon: Clock, title: "Fresh Made", desc: "Shipped within 24hrs" }
        ].map((f, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white border border-amber-100 hover:shadow-lg transition-all">
            <f.icon className="w-10 h-10 mx-auto mb-4 text-amber-600" />
            <h3 className="font-bold text-lg mb-2 text-amber-900">{f.title}</h3>
            <p className="text-sm text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TestimonialsSection = () => (
  <div className="bg-white py-20 px-4 border-t border-amber-50">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-amber-600 font-bold tracking-widest uppercase text-xs">Testimonials</span>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-950 mt-2">Love from our Customers</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="bg-[#fffbf2] p-8 rounded-3xl border border-amber-100 relative hover:-translate-y-1 transition-transform">
            <Quote className="w-10 h-10 text-amber-200 absolute top-6 right-6" />
            <div className="flex text-yellow-400 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current"/>)}</div>
            <p className="text-gray-600 mb-6 italic leading-relaxed">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center font-bold text-amber-900">{t.name[0]}</div>
              <div><h4 className="font-bold text-gray-900 text-sm">{t.name}</h4><p className="text-xs text-gray-500">{t.location}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TrustBar = () => (
  <div className="bg-amber-950 text-amber-100/90 py-3 overflow-hidden border-b border-amber-800">
    <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs md:text-sm font-medium overflow-x-auto gap-8 whitespace-nowrap scrollbar-hide">
       <div className="flex items-center"><Award className="w-4 h-4 mr-2 text-amber-400" /> FSSAI Certified: {FSSAI_LICENSE}</div>
       <div className="flex items-center"><ShieldCheck className="w-4 h-4 mr-2 text-amber-400" /> GI Tagged (Atreyapuram)</div>
       <div className="flex items-center"><Heart className="w-4 h-4 mr-2 text-amber-400" /> Women Empowerment</div>
       <div className="flex items-center"><Truck className="w-4 h-4 mr-2 text-amber-400" /> All India Shipping</div>
    </div>
  </div>
);

// --- PRODUCT MODAL WITH ARROWS ---
const ProductModal = ({ product, isOpen, onClose, onAdd }) => {
  const [activeImage, setActiveImage] = useState(0);
  
  // Reset image when product changes
  useEffect(() => { 
    setActiveImage(0); 
  }, [product]);

  if (!isOpen || !product) return null;
  
  const images = product.images && product.images.length > 0 ? product.images : [];
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-amber-950/40 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-[#fffbf2] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row border border-amber-100">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white/80 rounded-full hover:bg-white text-gray-800 transition-colors shadow-sm"><X className="w-6 h-6" /></button>

        <div className={`md:w-1/2 bg-gradient-to-br ${product.gradient} p-8 flex flex-col items-center justify-center relative overflow-hidden group`}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')] opacity-40"></div>
          
          <div className="relative z-10 w-full aspect-square mb-4 rounded-2xl overflow-hidden shadow-2xl bg-white border-4 border-white/50 flex items-center justify-center">
             {images.length > 0 ? (
               <img 
                 src={images[activeImage]} 
                 alt={product.name} 
                 className="w-full h-full object-cover" 
                 onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400?text=No+Image"; }}
               />
             ) : (
                <div className="flex items-center justify-center h-full bg-amber-50 text-amber-900/30 font-serif italic text-xl">Image Placeholder</div>
             )}

             {/* Arrow Buttons - Only show if multiple images */}
             {images.length > 1 && (
               <>
                 <button 
                   onClick={handlePrev} 
                   className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-800 transition-all opacity-0 group-hover:opacity-100"
                 >
                   <ChevronLeft className="w-6 h-6" />
                 </button>
                 <button 
                   onClick={handleNext} 
                   className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-800 transition-all opacity-0 group-hover:opacity-100"
                 >
                   <ChevronRight className="w-6 h-6" />
                 </button>
               </>
             )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="relative z-10 flex space-x-3 overflow-x-auto py-2 w-full justify-center px-4 scrollbar-hide">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)} 
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all cursor-pointer ${activeImage === idx ? 'border-amber-800 scale-110 shadow-lg' : 'border-white/50 opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => {e.target.style.display='none'}} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:w-1/2 p-8 md:p-10 flex flex-col bg-white">
          <div className="mb-auto">
             <div className="flex items-center gap-2 mb-3">
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
                {product.originalPrice && <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full">Save {discount}%</span>}
             </div>
             <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-950 mb-2 leading-tight">{product.name}</h2>
             <p className="text-lg text-amber-700 font-telugu mb-6">{product.teluguName}</p>
             
             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-amber-50 p-3 rounded-xl flex items-center gap-3">
                   <div className="bg-white p-2 rounded-full shadow-sm"><Clock className="w-4 h-4 text-amber-600"/></div>
                   <div><p className="text-xs text-amber-900/60 font-bold uppercase">Shelf Life</p><p className="text-sm font-semibold text-amber-900">{product.shelfLife}</p></div>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl flex items-center gap-3">
                   <div className="bg-white p-2 rounded-full shadow-sm"><Star className="w-4 h-4 text-amber-600 fill-amber-600"/></div>
                   <div><p className="text-xs text-amber-900/60 font-bold uppercase">Rating</p><p className="text-sm font-semibold text-amber-900">{product.rating}/5.0</p></div>
                </div>
             </div>

             <div className="prose prose-amber text-gray-600 mb-6">
               <p>{product.description}</p>
             </div>
             
             <div className="flex items-start gap-3 p-4 bg-yellow-50/50 rounded-xl border border-yellow-100">
               <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"/>
               <div><h4 className="font-bold text-yellow-900 text-sm">Ingredients</h4><p className="text-sm text-yellow-800/80">{product.ingredients}</p></div>
             </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mt-6 flex items-center justify-between gap-4">
             <div>
                <p className="text-sm text-gray-400 line-through">₹{product.originalPrice}</p>
                <p className="text-3xl font-serif font-bold text-amber-900">₹{product.price}</p>
                <p className="text-xs text-gray-500">{product.packSize}</p>
             </div>
             <Button onClick={() => { onAdd(product); onClose(); }} className="flex-1 shadow-amber-200">Add to Box</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onAdd, onClick }) => {
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  return (
    <div onClick={() => onClick(product)} className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-amber-50 flex flex-col h-full cursor-pointer relative hover:-translate-y-1">
      <div className={`h-64 w-full bg-gradient-to-br ${product.gradient} relative flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')] opacity-30"></div>
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300?text=No+Image"; }} />
        ) : (
          <div className="relative w-48 h-16 bg-white/40 backdrop-blur-sm border-2 border-white/60 rounded-lg transform rotate-[-5deg] flex items-center justify-center"><span className="text-amber-900/40 font-serif">No Image</span></div>
        )}
        {product.isBestSeller && <span className="absolute top-4 left-4 bg-amber-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg z-20 tracking-wider uppercase">Best Seller</span>}
        {product.originalPrice && <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur text-red-600 text-xs font-bold px-2 py-1 rounded-lg shadow-sm z-20">Save {discount}%</span>}
      </div>
      
      <div className="p-6 flex-1 flex flex-col relative">
        <div className="mb-2">
          <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1">{product.category}</p>
          <h3 className="font-serif font-bold text-xl text-gray-900 leading-tight mb-1">{product.name}</h3>
          <p className="text-sm text-amber-700 font-telugu opacity-80">{product.teluguName}</p>
        </div>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
        
        <div className="mt-auto pt-4 border-t border-dashed border-gray-100 flex items-end justify-between">
           <div>
             <span className="text-2xl font-serif font-bold text-amber-900">₹{product.price}</span>
             <span className="text-sm text-gray-400 line-through ml-2">₹{product.originalPrice}</span>
           </div>
           {/* Fixed: "Add to Box" button at bottom instead of floating plus */}
           <Button 
             onClick={(e) => { e.stopPropagation(); onAdd(product); }} 
             className="!px-4 !py-2 !text-sm !rounded-lg"
           >
             Add to Box
           </Button>
        </div>
      </div>
    </div>
  );
};

// --- HERO SECTION ---
const HeroSection = ({ setView }) => (
  <div className="relative bg-[#fffbf2] overflow-hidden min-h-[85vh] flex items-center">
    <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]"></div>
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-200 to-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-rose-200 to-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
      <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="space-y-8 animate-in slide-in-from-left duration-1000">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-amber-200 rounded-full px-4 py-1.5 shadow-sm">
            <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
            <span className="text-xs font-bold text-amber-900 uppercase tracking-widest">Taking Orders for Festivals</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-[1.1] text-amber-950">The Royal <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Paper Sweet</span></h1>
          <p className="text-xl text-gray-600 max-w-lg leading-relaxed font-light">Handcrafted in <strong>Atreyapuram</strong> using a 300-year-old traditional method. Wafer-thin rice layers folded with pure ghee & organic jaggery.</p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button onClick={() => document.getElementById('products').scrollIntoView({behavior: 'smooth'})} className="px-8 py-4 text-lg shadow-amber-200">Start Ordering</Button>
            <Button variant="outline" onClick={() => setView('about')} className="px-8 py-4 text-lg">Our Story</Button>
          </div>
          <div className="flex items-center gap-6 pt-6 opacity-80 grayscale hover:grayscale-0 transition-all">
             <div className="text-center"><h4 className="font-bold text-2xl text-amber-900">2k+</h4><p className="text-xs uppercase text-gray-500 tracking-wider">Happy Customers</p></div>
             <div className="w-px h-10 bg-amber-200"></div>
             <div className="text-center"><h4 className="font-bold text-2xl text-amber-900">4.9</h4><p className="text-xs uppercase text-gray-500 tracking-wider">Star Rating</p></div>
             <div className="w-px h-10 bg-amber-200"></div>
             <div className="text-center"><h4 className="font-bold text-2xl text-amber-900">100%</h4><p className="text-xs uppercase text-gray-500 tracking-wider">Authentic</p></div>
          </div>
        </div>
        <div className="relative animate-in zoom-in duration-1000 delay-200">
           <div className="relative z-10 transform hover:rotate-2 transition-transform duration-500">
              <div className="aspect-[4/5] rounded-[2.5rem] bg-gradient-to-b from-amber-800 to-amber-950 shadow-2xl p-2 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')] opacity-20"></div>
                 <div className="absolute inset-2 border border-amber-500/30 rounded-[2rem]"></div>
                 <div className="h-full flex flex-col items-center justify-center text-center p-8 text-amber-100">
                    <ChefHat className="w-16 h-16 mb-6 text-amber-400 opacity-80" />
                    <h3 className="font-serif text-4xl italic mb-2">Putharekulu</h3>
                    <p className="text-amber-400/80 uppercase tracking-[0.2em] text-sm">Est. 1980</p>
                    <div className="mt-12 bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10"><p className="font-medium">"Melts in your mouth,<br/>stays in your heart."</p></div>
                 </div>
              </div>
              <div className="absolute top-10 -right-6 bg-white p-4 rounded-2xl shadow-xl animate-bounce duration-[3000ms]"><div className="flex items-center gap-3"><div className="bg-green-100 p-2 rounded-full"><ShieldCheck className="w-6 h-6 text-green-600"/></div><div><p className="text-xs text-gray-500 font-bold uppercase">Certified</p><p className="font-bold text-gray-900">GI Tagged</p></div></div></div>
           </div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-amber-200/50 rounded-full mix-blend-multiply filter blur-3xl -z-10"></div>
        </div>
      </div>
    </div>
  </div>
);

// --- VIEW COMPONENTS (Cart, Checkout, etc.) ---

const CartView = ({ 
  cart, updateQty, removeFromCart, cartTotal, 
  SHIPPING_CHARGES, PACKING_CHARGES, 
  setView, couponCode, setCouponCode, applyCoupon, 
  discountError, appliedDiscount 
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in">
      <div className="flex items-center gap-2 mb-8">
        <button onClick={() => setView('home')} className="text-gray-500 hover:text-amber-800">Home</button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="font-bold text-gray-900">Cart</span>
      </div>
      <h2 className="text-3xl font-serif font-bold text-amber-950 mb-8">Your Basket</h2>
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4"/>
          <p className="text-gray-500 text-lg">Your basket feels light.</p>
          <Button onClick={() => setView('home')} className="mt-6">Start Shopping</Button>
        </div>
      ) : (
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">{cart.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-4">
               {/* Fixed: Show Image in Cart */}
               <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                 {item.images && item.images.length > 0 ? (
                   <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                 ) : (
                   <div className={`w-full h-full bg-gradient-to-br ${item.gradient}`}></div>
                 )}
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">{item.name}</h3>
                 <p className="text-xs text-gray-500">{item.packSize}</p>
                 <div className="mt-2 font-bold text-amber-700">₹{item.price * item.quantity}</div>
               </div>
             </div>
             <div className="flex flex-col items-end gap-2">
               <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
               <div className="flex items-center bg-gray-50 rounded-lg">
                 <button onClick={() => updateQty(item.id, -1)} className="p-2"><Minus className="w-4 h-4"/></button>
                 <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                 <button onClick={() => updateQty(item.id, 1)} className="p-2"><Plus className="w-4 h-4"/></button>
               </div>
             </div>
          </div>))}
        </div>
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-lg h-fit sticky top-24">
          <h3 className="font-bold text-lg mb-6">Order Summary</h3>
          <div className="space-y-3 text-sm text-gray-600 pb-6 border-b border-gray-100">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{cartTotal}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>₹{SHIPPING_CHARGES}</span></div>
            <div className="flex justify-between"><span>Packing</span><span>₹{PACKING_CHARGES}</span></div>
            
            {/* COUPON INPUT */}
            <div className="pt-4">
              <label className="text-xs font-bold text-gray-500 uppercase">Promo Code</label>
              <div className="flex gap-2 mt-1">
                <input 
                  type="text" 
                  placeholder="Enter Coupon Code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm uppercase outline-none focus:border-amber-500"
                />
                <button onClick={applyCoupon} className="bg-amber-900 text-white px-4 rounded-lg text-sm font-bold hover:bg-amber-800">Apply</button>
              </div>
              {discountError && <p className="text-red-500 text-xs mt-1">{discountError}</p>}
              {appliedDiscount > 0 && <p className="text-green-600 text-xs mt-1 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Coupon applied!</p>}
            </div>

            {appliedDiscount > 0 && (
              <div className="flex justify-between text-green-600 font-bold bg-green-50 p-2 rounded-lg">
                <span>Discount</span>
                <span>- ₹{appliedDiscount}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between font-bold text-xl text-amber-950 py-4"><span>Total</span><span>₹{Math.max(0, cartTotal + SHIPPING_CHARGES + PACKING_CHARGES - appliedDiscount)}</span></div>
          <Button className="w-full" disabled={cart.length === 0} onClick={() => setView('checkout')}>Checkout</Button>
        </div>
      </div>
      )}
    </div>
  );
};

const SuccessView = ({ orderId, setView }) => (
  <div className="max-w-md mx-auto px-4 py-20 text-center animate-in zoom-in">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <Check className="w-10 h-10 text-green-600" />
    </div>
    <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h2>
    <p className="text-gray-600 mb-6">Thank you for ordering. Your order has been received.</p>
    
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Order ID</p>
      <p className="text-xl font-mono font-bold text-gray-900 tracking-wider">#{orderId || "DEMO-1234"}</p>
    </div>

    <Button onClick={() => setView('home')} className="w-full">Continue Shopping</Button>
  </div>
);

const CheckoutView = ({ cart, cartTotal, SHIPPING_CHARGES, PACKING_CHARGES, appliedDiscount, couponCode, setView, setCart, setAppliedDiscount, setCouponCode, setOrderId }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', city: '', pincode: '' });
  const [loading, setLoading] = useState(false);
  
  const handleOrder = async (e) => { 
    e.preventDefault(); 
    setLoading(true);
    
    const finalTotal = Math.max(0, cartTotal + SHIPPING_CHARGES + PACKING_CHARGES - appliedDiscount);
    
    // Construct Order Object
    const orderData = {
      customer: formData,
      items: cart,
      billing: {
        subtotal: cartTotal,
        shipping: SHIPPING_CHARGES,
        packing: PACKING_CHARGES,
        discount: appliedDiscount,
        couponUsed: couponCode,
        total: finalTotal
      },
      status: "New",
      date: new Date().toISOString()
    };

    try {
      let refId = "DEMO-" + Math.floor(Math.random() * 10000);
      if (db) {
        const docRef = await addDoc(collection(db, "orders"), orderData);
        refId = docRef.id;
      } else {
        console.log("Database not connected. Simulating order:", orderData);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
      }
      
      setOrderId(refId);
      setCart([]); 
      setAppliedDiscount(0); 
      setCouponCode('');
      setLoading(false);
      setView('success');

    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Order Failed: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-amber-100">
        <h2 className="text-2xl font-bold mb-6">Secure Checkout</h2>
        <form onSubmit={handleOrder} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input required placeholder="Name" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-amber-500" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})}/>
            <input required placeholder="Phone" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-amber-500" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})}/>
          </div>
          <textarea required rows="3" placeholder="Address" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-amber-500" value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})}/>
          <div className="grid md:grid-cols-2 gap-4">
            <input required placeholder="City" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-amber-500" value={formData.city} onChange={e=>setFormData({...formData, city:e.target.value})}/>
            <input required placeholder="Pincode" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-amber-500" value={formData.pincode} onChange={e=>setFormData({...formData, pincode:e.target.value})}/>
          </div>
          <Button type="submit" disabled={loading} className="w-full !py-4">
            {loading ? "Processing..." : "Place Order"}
          </Button>
        </form>
      </div>
    </div>
  );
};

const TrackOrderView = () => {
  const [trackingId, setTrackingId] = useState('');
  const [courier, setCourier] = useState('delhivery');

  const handleTrack = (e) => {
    e.preventDefault();
    if(!trackingId) return;

    let url = '';
    if(courier === 'delhivery') {
      url = `https://www.delhivery.com/track/package/${trackingId}`;
    } else if (courier === 'dtdc') {
      url = `https://www.dtdc.in/tracking/shipment-tracking.asp`; 
    } else if (courier === 'shiprocket') {
      url = `https://shiprocket.co/tracking/${trackingId}`;
    }

    window.open(url, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 animate-in fade-in duration-500">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Track Your Sweet Box</h2>
      <p className="text-gray-600 mb-8">Enter your Tracking ID (AWB) sent via SMS/Email.</p>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-amber-100">
        <form onSubmit={handleTrack} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Courier Partner</label>
            <div className="grid grid-cols-3 gap-4">
              <button 
                type="button"
                onClick={() => setCourier('delhivery')}
                className={`p-4 rounded-xl border-2 transition-all font-semibold ${courier === 'delhivery' ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-gray-200 hover:border-amber-200'}`}
              >
                Delhivery
              </button>
              <button 
                type="button"
                onClick={() => setCourier('dtdc')}
                className={`p-4 rounded-xl border-2 transition-all font-semibold ${courier === 'dtdc' ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-gray-200 hover:border-amber-200'}`}
              >
                DTDC
              </button>
              <button 
                type="button"
                onClick={() => setCourier('shiprocket')}
                className={`p-4 rounded-xl border-2 transition-all font-semibold ${courier === 'shiprocket' ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-gray-200 hover:border-amber-200'}`}
              >
                Shiprocket
              </button>
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-gray-700">Tracking ID / AWB Number</label>
             <div className="relative">
               <input 
                  type="text" 
                  required
                  placeholder={courier === 'delhivery' ? "Ex: 123456789012" : "Ex: D12345678"}
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all pl-11"
               />
               <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4.5" />
             </div>
          </div>

          <Button type="submit" className="w-full !py-4" disabled={!trackingId}>
             Track Order <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
};

const AboutView = ({ setView }) => (
  <div className="max-w-4xl mx-auto px-4 py-20">
    <h1 className="text-4xl font-serif font-bold text-center mb-8">Our Heritage</h1>
    <p className="text-center text-gray-600 text-lg">We are dedicated to preserving the art of Atreyapuram Putharekulu.</p>
    <div className="text-center mt-8"><Button onClick={() => setView('home')}>Back to Shop</Button></div>
  </div>
);

// --- MAIN APP ---
export default function App() {
  const [view, setView] = useState('home'); 
  const [cart, setCart] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Coupons State
  const [activeCoupons, setActiveCoupons] = useState(DEFAULT_COUPONS);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const [orderId, setOrderId] = useState(null);

  // --- FIREBASE FETCHING ---
  useEffect(() => {
    const fetchCoupons = async () => {
      if (!db) return; 
      try {
        const querySnapshot = await getDocs(collection(db, "coupons"));
        const fetchedCoupons = {};
        querySnapshot.forEach((doc) => {
          fetchedCoupons[doc.id] = doc.data();
        });
        if (Object.keys(fetchedCoupons).length > 0) {
          setActiveCoupons(fetchedCoupons);
        }
      } catch (err) {
        console.log("Using default coupons:", err);
      }
    };
    fetchCoupons();
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [view]);
  useEffect(() => { const savedCart = localStorage.getItem('putharekulu-cart'); if (savedCart) setCart(JSON.parse(savedCart)); }, []);
  useEffect(() => { localStorage.setItem('putharekulu-cart', JSON.stringify(cart)); }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    triggerToast();
  };

  const updateQty = (id, delta) => { setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)); };
  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const triggerToast = () => { setShowToast(true); setTimeout(() => setShowToast(false), 2000); };
  const handleBulkOrder = () => { window.open(`https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent("I need details for a bulk/wedding order.")}`, '_blank'); };

  // --- DYNAMIC COUPON LOGIC ---
  const applyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    const coupon = activeCoupons[code];
    const now = new Date(); // Current date for expiry check

    // 1. Check if coupon code exists
    if (!coupon) {
      setDiscountError('Invalid coupon code');
      setAppliedDiscount(0);
      return;
    }

    // 2. Check if coupon is active
    if (coupon.isActive === false) {
      setDiscountError('This coupon is no longer active');
      setAppliedDiscount(0);
      return;
    }

    // 3. Check Expiry Date
    if (coupon.expiryDate) {
      const expiry = new Date(coupon.expiryDate);
      if (now > expiry) {
        setDiscountError('This coupon has expired');
        setAppliedDiscount(0);
        return;
      }
    }

    // 4. Check Minimum Order Value
    if (cartTotal < coupon.minOrder) {
      setDiscountError(`Add items worth ₹${coupon.minOrder} to apply`);
      setAppliedDiscount(0);
      return;
    }

    // Calculate Discount
    let discount = 0;
    if (coupon.type === 'percent') {
      discount = (cartTotal * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    setAppliedDiscount(Math.min(discount, cartTotal));
    setDiscountError('');
  };

  return (
    <div className="min-h-screen bg-[#fffbf2] font-sans selection:bg-amber-100 text-gray-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        :root { font-family: 'Plus Jakarta Sans', sans-serif; }
        h1, h2, h3, .font-serif { font-family: 'Playfair Display', serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>

      {cart.length > 0 && view !== 'cart' && (
        <div className="fixed bottom-6 right-6 z-50 md:hidden animate-in zoom-in">
          <button onClick={() => setView('cart')} className="bg-amber-900 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white">
            <ShoppingBag className="w-6 h-6" />
            <span className="font-bold">{cart.length}</span>
          </button>
        </div>
      )}

      <TrustBar />
      
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-amber-100/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('home')}>
            <div className="w-10 h-10 bg-amber-900 rounded-xl flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg group-hover:rotate-6 transition-transform">A</div>
            <div><h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">Atreyapuram <span className="text-amber-600 block text-xs font-normal tracking-widest uppercase">Pure</span></h1></div>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-600">
            <button onClick={() => setView('home')} className="hover:text-amber-700 transition-colors">Shop</button>
            <button onClick={handleBulkOrder} className="hover:text-amber-700 transition-colors">Bulk Orders</button>
            <button onClick={() => setView('about')} className="hover:text-amber-700 transition-colors">Our Story</button>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => setView('track')} className="hidden md:flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-full transition-colors"><Truck className="w-3 h-3" /> TRACK ORDER</button>
            <button onClick={() => setView('cart')} className="relative p-2 text-gray-700 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"><ShoppingBag className="w-6 h-6" />{cart.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}</button>
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu className="w-6 h-6" /></button>
          </div>
        </div>
        {isMenuOpen && <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-2 shadow-xl absolute w-full"><button onClick={()=>{setView('home');setIsMenuOpen(false)}} className="block w-full text-left p-3 font-bold text-gray-700 bg-gray-50 rounded-xl">Shop</button><button onClick={()=>{handleBulkOrder();setIsMenuOpen(false)}} className="block w-full text-left p-3 font-medium text-gray-600">Bulk Orders</button><button onClick={()=>{setView('track');setIsMenuOpen(false)}} className="block w-full text-left p-3 font-medium text-gray-600">Track Order</button></div>}
      </header>

      <main>
        {view === 'home' && (
          <div className="animate-in fade-in duration-500">
            <HeroSection setView={setView} />
            <Features />
            <div id="products" className="max-w-7xl mx-auto px-4 py-24">
              <div className="text-center mb-16"><span className="text-amber-600 font-bold tracking-widest uppercase text-xs mb-2 block">Fresh from Kitchen</span><h2 className="text-4xl md:text-5xl font-serif font-bold text-amber-950 mb-6">Our Collections</h2><div className="w-24 h-1 bg-amber-200 mx-auto rounded-full"></div></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">{PRODUCTS.map(product => (<ProductCard key={product.id} product={product} onAdd={addToCart} onClick={setSelectedProduct} />))}</div>
            </div>
            <TestimonialsSection />
            <div className="bg-amber-900 text-amber-100 py-24 px-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-amber-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
               <div className="max-w-4xl mx-auto text-center relative z-10"><MapPin className="w-12 h-12 mx-auto mb-6 text-amber-400" /><h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white">Visit Our Kitchen</h2><p className="text-xl text-amber-200/80 mb-10 font-light">Located in the heart of East Godavari. Experience the aroma of pure ghee and tradition.</p><div className="flex justify-center flex-wrap gap-4"><div className="flex items-center bg-white/10 backdrop-blur px-8 py-4 rounded-full border border-white/10 hover:bg-white/20 transition-colors cursor-pointer"><Phone className="w-5 h-5 mr-3 text-amber-400" /><span className="font-bold tracking-wide">+91 6281188024</span></div></div></div>
            </div>
          </div>
        )}

        {view === 'cart' && (
          <CartView 
            cart={cart}
            updateQty={updateQty}
            removeFromCart={removeFromCart}
            cartTotal={cartTotal}
            SHIPPING_CHARGES={SHIPPING_CHARGES}
            PACKING_CHARGES={PACKING_CHARGES}
            setView={setView}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            applyCoupon={applyCoupon}
            discountError={discountError}
            appliedDiscount={appliedDiscount}
          />
        )}
        
        {view === 'checkout' && (
          <CheckoutView 
            cart={cart}
            cartTotal={cartTotal}
            SHIPPING_CHARGES={SHIPPING_CHARGES}
            PACKING_CHARGES={PACKING_CHARGES}
            appliedDiscount={appliedDiscount}
            couponCode={couponCode}
            setView={setView}
            setCart={setCart}
            setAppliedDiscount={setAppliedDiscount}
            setCouponCode={setCouponCode}
            setOrderId={setOrderId}
          />
        )}
        {view === 'success' && <SuccessView orderId={orderId} setView={setView} />}
        {view === 'track' && <TrackOrderView />}
        {view === 'about' && <AboutView setView={setView} />}
        
        <ProductModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} />
      </main>

      <footer className="bg-amber-950 text-amber-200/60 py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
          <div className="col-span-1 md:col-span-2"><div className="flex items-center gap-3 mb-6 text-white"><div className="w-8 h-8 bg-amber-800 rounded-lg flex items-center justify-center font-serif font-bold">A</div><span className="text-xl font-bold font-serif">Atreyapuram Pure</span></div><p className="leading-relaxed max-w-sm">Preserving the culinary heritage of Andhra Pradesh. We ship authentic, GI Tagged Putharekulu worldwide.</p></div>
          <div><h4 className="text-white font-bold mb-6 tracking-widest uppercase text-xs">Quick Links</h4><ul className="space-y-4"><li><button onClick={() => setView('track')} className="hover:text-white transition-colors">Track Order</button></li><li><button onClick={() => setView('about')} className="hover:text-white transition-colors">Our Story</button></li><li><button onClick={handleBulkOrder} className="hover:text-white transition-colors">Bulk Inquiries</button></li></ul></div>
          <div><h4 className="text-white font-bold mb-6 tracking-widest uppercase text-xs">Follow Us</h4><div className="flex space-x-4"><button onClick={() => window.open(INSTAGRAM_URL, '_blank')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all"><Instagram className="w-5 h-5" /></button><button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><Facebook className="w-5 h-5" /></button></div></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/5 text-center text-xs">© 2024 Atreyapuram Pure. Made with love in India. FSSAI Lic. No: {FSSAI_LICENSE}</div>
      </footer>

      {showToast && <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur text-white px-8 py-4 rounded-full shadow-2xl flex items-center space-x-4 z-50 animate-in slide-in-from-bottom duration-300"><div className="bg-green-500 rounded-full p-1"><ShieldCheck className="w-4 h-4 text-white" /></div><span className="font-medium">Added to box!</span></div>}
    </div>
  );
}