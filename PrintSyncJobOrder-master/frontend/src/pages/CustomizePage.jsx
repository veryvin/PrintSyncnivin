import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

const DEPOSIT_AMOUNT = 500;

// ── Icons ─────────────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);
const CartIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// ── Realistic Basketball Jersey SVG (Front) ───────────────────────────────────
const JerseyFront = ({ primary, accent, text, number, logo }) => (
  <svg viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    <defs>
      <linearGradient id="bodyShade" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#000" stopOpacity="0.08" />
        <stop offset="50%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.08" />
      </linearGradient>
      <linearGradient id="sleeveShadeL" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#000" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#000" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="sleeveShadeR" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.15" />
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.18" />
      </filter>
    </defs>

    <g filter="url(#shadow)">
      {/* ── Body ── */}
      <path
        d="M 105 115 L 105 420 Q 105 435 120 435 L 280 435 Q 295 435 295 420 L 295 115 Z"
        fill={primary} stroke={accent} strokeWidth="2.5"
      />

      {/* ── Left sleeve ── */}
      <path
        d="M 105 115 L 55 80 Q 40 72 35 88 L 25 145 Q 22 160 38 163 L 105 170 Z"
        fill={primary} stroke={accent} strokeWidth="2.5"
      />

      {/* ── Right sleeve ── */}
      <path
        d="M 295 115 L 345 80 Q 360 72 365 88 L 375 145 Q 378 160 362 163 L 295 170 Z"
        fill={primary} stroke={accent} strokeWidth="2.5"
      />

      {/* ── Collar V-neck ── */}
      <path
        d="M 150 105 Q 170 80 200 115 Q 230 80 250 105"
        fill="none" stroke={accent} strokeWidth="10" strokeLinecap="round"
      />
      <path
        d="M 150 105 Q 170 80 200 115 Q 230 80 250 105"
        fill="none" stroke={primary} strokeWidth="5" strokeLinecap="round"
      />

      {/* ── Shoulder seams ── */}
      <line x1="105" y1="115" x2="150" y2="105" stroke={accent} strokeWidth="2.5" />
      <line x1="295" y1="115" x2="250" y2="105" stroke={accent} strokeWidth="2.5" />

      {/* ── Side stripes ── */}
      <rect x="105" y="160" width="14" height="275" rx="2" fill={accent} opacity="0.55" />
      <rect x="281" y="160" width="14" height="275" rx="2" fill={accent} opacity="0.55" />

      {/* ── Sleeve accent bands ── */}
      <path d="M 55 80 Q 40 72 35 88 L 37 100 Q 42 86 57 93 L 95 115 L 105 115 L 65 88 Z"
        fill={accent} opacity="0.4" />
      <path d="M 345 80 Q 360 72 365 88 L 363 100 Q 358 86 343 93 L 305 115 L 295 115 L 335 88 Z"
        fill={accent} opacity="0.4" />

      {/* ── Body shading overlay ── */}
      <path
        d="M 105 115 L 105 420 Q 105 435 120 435 L 280 435 Q 295 435 295 420 L 295 115 Z"
        fill="url(#bodyShade)"
      />
      <path
        d="M 105 115 L 55 80 Q 40 72 35 88 L 25 145 Q 22 160 38 163 L 105 170 Z"
        fill="url(#sleeveShadeL)"
      />
      <path
        d="M 295 115 L 345 80 Q 360 72 365 88 L 375 145 Q 378 160 362 163 L 295 170 Z"
        fill="url(#sleeveShadeR)"
      />

      {/* ── Bottom hem accent ── */}
      <path d="M 105 420 Q 105 435 120 435 L 280 435 Q 295 435 295 420 L 295 428 Q 295 438 280 438 L 120 438 Q 105 438 105 428 Z"
        fill={accent} opacity="0.5" />

      {/* ── Mesh texture lines (subtle) ── */}
      {[155, 175, 195, 215, 235, 255, 275, 295, 315, 335, 355, 375, 395].map((y, i) => (
        <line key={i} x1="119" y1={y} x2="281" y2={y} stroke={accent} strokeWidth="0.4" opacity="0.15" />
      ))}

      {/* ── Number ── */}
      <text x="200" y="340" textAnchor="middle" fill={accent}
        fontSize="110" fontWeight="900" fontFamily="'Arial Black', Impact, sans-serif"
        letterSpacing="-4" opacity="0.95">
        {number || '24'}
      </text>

      {/* ── Team Name ── */}
      <text x="200" y="235" textAnchor="middle" fill={accent}
        fontSize="28" fontWeight="900" fontFamily="'Arial Black', Impact, sans-serif"
        letterSpacing="3">
        {(text || 'TEAM NAME').toUpperCase()}
      </text>

      {/* ── Logo placeholder / uploaded logo ── */}
      {logo ? (
        <image href={logo} x="168" y="148" width="64" height="64" preserveAspectRatio="xMidYMid meet"
          clipPath="circle(32px at 32px 32px)" />
      ) : (
        <g>
          <circle cx="200" cy="178" r="28" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.4" strokeDasharray="4 3" />
          <text x="200" y="182" textAnchor="middle" fill={accent} fontSize="10" fontWeight="bold"
            fontFamily="'Arial Black', sans-serif" opacity="0.5" letterSpacing="1">LOGO</text>
        </g>
      )}
    </g>
  </svg>
);

// ── Realistic Basketball Jersey SVG (Back) ────────────────────────────────────
const JerseyBack = ({ primary, accent, number }) => (
  <svg viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
    <defs>
      <linearGradient id="bodyShadeB" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#000" stopOpacity="0.08" />
        <stop offset="50%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.08" />
      </linearGradient>
      <filter id="shadowB" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.18" />
      </filter>
    </defs>
    <g filter="url(#shadowB)">
      <path d="M 105 115 L 105 420 Q 105 435 120 435 L 280 435 Q 295 435 295 420 L 295 115 Z"
        fill={primary} stroke={accent} strokeWidth="2.5" />
      <path d="M 105 115 L 55 80 Q 40 72 35 88 L 25 145 Q 22 160 38 163 L 105 170 Z"
        fill={primary} stroke={accent} strokeWidth="2.5" />
      <path d="M 295 115 L 345 80 Q 360 72 365 88 L 375 145 Q 378 160 362 163 L 295 170 Z"
        fill={primary} stroke={accent} strokeWidth="2.5" />
      {/* Back collar */}
      <path d="M 155 108 Q 200 95 245 108" fill="none" stroke={accent} strokeWidth="10" strokeLinecap="round" />
      <path d="M 155 108 Q 200 95 245 108" fill="none" stroke={primary} strokeWidth="5" strokeLinecap="round" />
      <line x1="105" y1="115" x2="155" y2="108" stroke={accent} strokeWidth="2.5" />
      <line x1="295" y1="115" x2="245" y2="108" stroke={accent} strokeWidth="2.5" />
      <rect x="105" y="160" width="14" height="275" rx="2" fill={accent} opacity="0.55" />
      <rect x="281" y="160" width="14" height="275" rx="2" fill={accent} opacity="0.55" />
      <path d="M 105 420 Q 105 435 120 435 L 280 435 Q 295 435 295 420 L 295 428 Q 295 438 280 438 L 120 438 Q 105 438 105 428 Z"
        fill={accent} opacity="0.5" />
      {[155, 175, 195, 215, 235, 255, 275, 295, 315, 335, 355, 375, 395].map((y, i) => (
        <line key={i} x1="119" y1={y} x2="281" y2={y} stroke={accent} strokeWidth="0.4" opacity="0.15" />
      ))}
      <text x="200" y="185" textAnchor="middle" fill={accent}
        fontSize="22" fontWeight="900" fontFamily="'Arial Black', Impact, sans-serif" letterSpacing="4">
        SURNAME
      </text>
      <text x="200" y="350" textAnchor="middle" fill={accent}
        fontSize="110" fontWeight="900" fontFamily="'Arial Black', Impact, sans-serif" letterSpacing="-4">
        {number || '24'}
      </text>
      <path d="M 105 115 L 105 420 Q 105 435 120 435 L 280 435 Q 295 435 295 420 L 295 115 Z"
        fill="url(#bodyShadeB)" />
    </g>
  </svg>
);

// ── Color Picker with swatches + hex input + native picker ────────────────────
const QUICK_COLORS = [
  '#000000','#1a1a1a','#333333','#555555','#808080','#aaaaaa','#cccccc','#ffffff',
  '#ff0000','#cc0000','#ff4444','#ff6600','#ff8800','#ffaa00','#ffcc00','#ffff00',
  '#00cc00','#008800','#00ff88','#00ccaa','#00aaff','#0066ff','#0000ff','#4400cc',
  '#8800cc','#cc00aa','#ff00ff','#ff44aa','#ff99cc','#ffccee','#ffeedd','#ffe4b5',
  '#ff6347','#dc143c','#b22222','#8b0000','#556b2f','#006400','#228b22','#2e8b57',
  '#1e90ff','#4169e1','#00008b','#191970','#9400d3','#8a2be2','#6a0dad','#483d8b',
];

const ColorPicker = ({ label, value, onChange }) => {
  const [hex, setHex] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setHex(value); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleHexInput = (e) => {
    const v = e.target.value;
    setHex(v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
  };

  const handleNativePicker = (e) => {
    setHex(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="mb-4">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">{label}</label>
      <div className="relative" ref={ref}>
        {/* Trigger row */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
          <div className="w-9 h-9 rounded border-2 border-gray-300 shadow-sm flex-shrink-0 transition-transform hover:scale-110"
            style={{ backgroundColor: value, borderColor: value === '#ffffff' ? '#ccc' : value }} />
          <input
            type="text"
            value={hex}
            onChange={handleHexInput}
            onClick={e => e.stopPropagation()}
            placeholder="#000000"
            maxLength={7}
            className="w-28 px-2 py-1.5 border border-gray-200 text-xs font-mono text-[#111] focus:outline-none focus:border-[#111] uppercase"
          />
          {/* Native color input hidden behind a styled button */}
          <label className="cursor-pointer px-2 py-1.5 border border-gray-200 text-[10px] font-bold text-gray-500 hover:bg-gray-50 uppercase tracking-wide flex items-center gap-1">
            <span>🎨</span>
            <input type="color" value={value} onChange={handleNativePicker} className="sr-only" />
          </label>
          <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
            className="px-2 py-1.5 border border-gray-200 text-[10px] font-bold text-gray-500 hover:bg-gray-50 uppercase tracking-wide">
            {open ? '▲' : '▼'}
          </button>
        </div>

        {/* Swatch dropdown */}
        {open && (
          <div className="absolute z-50 top-12 left-0 bg-white border border-gray-200 shadow-xl p-3 w-72">
            <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2 font-bold">Quick Colors</p>
            <div className="grid grid-cols-8 gap-1.5 mb-3">
              {QUICK_COLORS.map(c => (
                <button key={c} onClick={() => { onChange(c); setHex(c); setOpen(false); }}
                  title={c}
                  className={`w-7 h-7 rounded transition-all hover:scale-125 hover:shadow-md ${value === c ? 'ring-2 ring-offset-1 ring-[#111] scale-110' : ''}`}
                  style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #ddd' : '1px solid transparent' }}
                />
              ))}
            </div>
            <div className="border-t border-gray-100 pt-2">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Custom Color</p>
              <div className="flex items-center gap-2">
                <input type="color" value={value} onChange={handleNativePicker}
                  className="w-10 h-9 border border-gray-200 cursor-pointer rounded" />
                <input type="text" value={hex} onChange={handleHexInput} placeholder="#000000" maxLength={7}
                  className="flex-1 px-2 py-1.5 border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#111] uppercase" />
                <button onClick={() => { if (/^#[0-9a-fA-F]{6}$/.test(hex)) { onChange(hex); setOpen(false); } }}
                  className="px-3 py-1.5 bg-[#111] text-white text-[10px] font-bold uppercase hover:bg-gray-800 transition">
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Step Indicator ─────────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep, completedSteps }) => {
  const steps = [
    { num: 1, label: 'Colors & Qty' },
    { num: 2, label: 'Text' },
    { num: 3, label: 'Logo' },
    { num: 4, label: 'Details' },
  ];
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((step, i) => {
        const isCompleted = completedSteps.includes(step.num);
        const isCurrent = currentStep === step.num;
        return (
          <React.Fragment key={step.num}>
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-[#111] text-white' : 'bg-gray-200 text-gray-400'}`}>
                {isCompleted ? <CheckIcon /> : step.num}
              </div>
              <span className={`text-xs font-medium hidden md:block whitespace-nowrap ${isCurrent ? 'text-[#111]' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 min-w-0 ${completedSteps.includes(step.num) ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Design Preview Panel ───────────────────────────────────────────────────────
const DesignPreview = ({ selectedProduct, primary, accent, text, number, logo, quantity }) => {
  const [side, setSide] = useState('front');
  return (
    <div className="bg-white border border-gray-200 flex flex-col" style={{ height: '100%' }}>
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Design Preview</p>
        <div className="flex gap-1">
          {['front', 'back'].map(s => (
            <button key={s} onClick={() => setSide(s)}
              className={`px-3 py-1 text-xs font-bold uppercase border transition ${side === s ? 'bg-[#111] text-white border-[#111]' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8" style={{ background: 'radial-gradient(ellipse at center, #e8e8e8 0%, #d0d0d0 100%)' }}>
        {selectedProduct ? (
          <div style={{ width: '260px', height: '312px' }}>
            {side === 'front'
              ? <JerseyFront primary={primary} accent={accent} text={text} number={number} logo={logo} />
              : <JerseyBack primary={primary} accent={accent} number={number} />}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-7xl mb-4" style={{ filter: 'grayscale(1) opacity(0.2)' }}>👕</p>
            <p className="text-sm text-gray-300 font-medium">Select a product to start designing</p>
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t border-gray-100 shrink-0">
        {selectedProduct ? (
          <>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500 font-medium">{selectedProduct.name}</span>
              <span className="text-xs text-gray-400">{quantity} × ₱{selectedProduct.price}</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Est. Total</span>
              <span className="text-2xl font-black text-[#111]">₱{(selectedProduct.price * quantity).toFixed(2)}</span>
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-300 text-center">No product selected</p>
        )}
        <div className="mt-3 space-y-0.5">
          {['Design preview is approximate', 'Final product may vary based on production', 'Admin will review and contact you'].map((note, i) => (
            <p key={i} className="text-[0.6rem] text-gray-300">• {note}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
const FONTS = ['INDUSTRIAL SANS', 'IMPACT', 'ARIAL BLACK', 'BEBAS NEUE', 'OSWALD'];

export default function CustomizePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Colors
  const [primaryColor, setPrimaryColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#f5e6a3');
  const [color1, setColor1] = useState('#ffffff');
  const [color2, setColor2] = useState('#ffffff');
  const [color3, setColor3] = useState('#ffffff');
  const [quantity, setQuantity] = useState(1);

  // Text
  const [customText, setCustomText] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('24');
  const [fontFamily, setFontFamily] = useState('INDUSTRIAL SANS');
  const [jerseyLayoutComments, setJerseyLayoutComments] = useState('');

  // Logo
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Customer
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderType, setOrderType] = useState('pickup');
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '', lastName: '', company: '', street: '', city: '', stateProvince: '', zipCode: '',
  });

  const totalPrice = selectedProduct ? (selectedProduct.price * (quantity || 0)).toFixed(2) : '0.00';

  useEffect(() => {
    fetchProducts();
    if (location.state?.selectedProduct) setSelectedProduct(location.state.selectedProduct);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  const compressImage = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        const max = 600;
        if (w > h && w > max) { h = (h * max) / w; w = max; }
        else if (h > max) { w = (w * max) / h; h = max; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
    setLogoFile(file);
    const compressed = await compressImage(file);
    setLogoPreview(compressed);
  };

  const goToStep = (step) => {
    setCompletedSteps(prev => prev.includes(currentStep) ? prev : [...prev, currentStep]);
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStep === 1 && !selectedProduct) { toast.error('Please select a product'); return; }
    if (currentStep === 4) { handleShowReview(); return; }
    goToStep(currentStep + 1);
  };

  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleShowReview = () => {
    if (!phoneNumber.trim()) { toast.error('Please enter your phone number'); return; }
    if (orderType === 'shipping') {
      const { firstName, lastName, street, city, stateProvince, zipCode } = shippingAddress;
      if (!firstName || !lastName || !street || !city || !stateProvince || !zipCode) {
        toast.error('Please fill out all shipping address fields'); return;
      }
    }
    setCompletedSteps(prev => prev.includes(4) ? prev : [...prev, 4]);
    setShowReview(true);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/orders', {
        userId: user.uid,
        customerName: user.displayName || user.email,
        customerEmail: user.email,
        phoneNumber,
        orderType,
        shippingAddress: orderType === 'shipping' ? shippingAddress : null,
        items: [{ productId: selectedProduct.id, productName: selectedProduct.name, quantity: parseInt(quantity), price: selectedProduct.price }],
        customizationDetails: {
          primaryColor, accentColor,
          additionalColors: { color1, color2, color3 },
          customText, jerseyNumber, fontFamily, jerseyLayoutComments,
          logoImage: logoPreview || null,
        },
        totalPrice: parseFloat(totalPrice),
        depositAmount: DEPOSIT_AMOUNT,
        depositPaid: false,
        status: 'pending',
      });
      toast.success('Order placed! Pay the ₱500 deposit to begin layout.');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to place order: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[#111]" />
    </div>
  );

  // ── REVIEW ────────────────────────────────────────────────────────────────────
  if (showReview) return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white border border-gray-200 p-8">
          <h2 className="text-2xl font-black text-[#111] uppercase mb-6">Review Your Order</h2>

          <div className="mb-6 border border-amber-300 bg-amber-50 rounded p-4">
            <p className="text-sm font-bold text-amber-800 mb-1">⚠ Required Deposit Before Layout</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              A deposit of <span className="font-bold">₱500</span> is required before the admin proceeds with your jersey layout/design.
              This will be applied to your total upon order completion.
            </p>
          </div>

          <div className="mb-8">
            {[
              ['Product', selectedProduct?.name],
              ['Primary Color', <span key="pc" className="flex justify-end gap-2 items-center"><div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: primaryColor }} /><span className="text-xs text-gray-400">{primaryColor}</span></span>],
              ['Accent Color', <span key="ac" className="flex justify-end gap-2 items-center"><div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: accentColor }} /><span className="text-xs text-gray-400">{accentColor}</span></span>],
              ['Text', customText || 'TEAM NAME'],
              ['Number', jerseyNumber || '24'],
              ['Font', fontFamily],
              ['Logo', logoFile ? '✓ Uploaded' : 'None'],
              ['Quantity', `${quantity} unit(s)`],
              ['Phone', phoneNumber],
              ['Order Type', orderType === 'pickup' ? 'Pick Up' : 'Shipping'],
            ].map(([label, value], i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
                <span className="text-sm font-bold text-right">{value}</span>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Unit Price</span><span>₱{selectedProduct?.price}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Quantity</span><span>{quantity}×</span></div>
            <div className="flex justify-between text-sm border-t border-gray-200 pt-2"><span className="text-gray-500">Order Total</span><span className="font-bold">₱{totalPrice}</span></div>
            <div className="flex justify-between text-sm bg-amber-100 border border-amber-300 rounded px-3 py-2 mt-2">
              <span className="font-bold text-amber-800">Deposit Due Now</span>
              <span className="font-black text-amber-900">₱{DEPOSIT_AMOUNT.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 pt-1">
              <span>Remaining balance after deposit</span>
              <span>₱{(parseFloat(totalPrice) - DEPOSIT_AMOUNT).toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={handlePlaceOrder} disabled={isSubmitting}
              className="w-full py-3 bg-[#111] text-white font-bold text-sm uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition flex items-center justify-center gap-2">
              <CartIcon /> {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
            </button>
            <p className="text-center text-[10px] text-gray-400">You will be asked to pay the ₱500 deposit on the next screen</p>
            <button onClick={() => setShowReview(false)}
              className="w-full py-2 border border-gray-300 text-[#111] font-medium text-sm hover:bg-gray-50 transition">
              ← Back to Design
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── MAIN ──────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-black text-[#111] uppercase mb-1">Design Studio</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">Configure your custom apparel specifications</p>

        <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

        <div className="flex gap-6" style={{ minHeight: '700px' }}>

          {/* ── LEFT: Form ─────────────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 flex flex-col" style={{ width: '440px', flexShrink: 0 }}>
            <div className="flex-1 overflow-y-auto p-6">

              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <h2 className="text-base font-black text-[#111] uppercase tracking-wide">Colors & Quantity</h2>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Select Product</label>
                    <select value={selectedProduct?.id || ''} onChange={(e) => setSelectedProduct(products.find(p => p.id === e.target.value))}
                      className="w-full px-3 py-2.5 border border-gray-200 text-sm text-[#111] bg-white focus:outline-none focus:border-[#111]">
                      <option value="">Choose a product...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} — ₱{p.price}</option>)}
                    </select>
                  </div>

                  <ColorPicker label="Primary Base Color" value={primaryColor} onChange={setPrimaryColor} />
                  <ColorPicker label="Accent Color" value={accentColor} onChange={setAccentColor} />

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Additional Colors (Optional)</label>
                    <div className="space-y-3 pl-2 border-l-2 border-gray-100">
                      <ColorPicker label="Color 1" value={color1} onChange={setColor1} />
                      <ColorPicker label="Color 2" value={color2} onChange={setColor2} />
                      <ColorPicker label="Color 3" value={color3} onChange={setColor3} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Quantity</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-9 h-9 border border-gray-200 text-[#111] font-bold text-lg flex items-center justify-center hover:bg-gray-50 transition select-none">−</button>
                      <input type="number" min="1" max="100" value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                        className="w-16 px-2 py-2 border border-gray-200 text-sm text-center text-[#111] font-bold focus:outline-none focus:border-[#111]" />
                      <button onClick={() => setQuantity(q => Math.min(100, q + 1))}
                        className="w-9 h-9 border border-gray-200 text-[#111] font-bold text-lg flex items-center justify-center hover:bg-gray-50 transition select-none">+</button>
                    </div>
                  </div>

                  {selectedProduct && (
                    <div className="bg-gray-50 px-4 py-3 border border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Est. Price</span>
                        <span className="font-black text-[#111]">₱{totalPrice}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <h2 className="text-base font-black text-[#111] uppercase tracking-wide">Text</h2>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Custom Text</label>
                    <input type="text" value={customText} onChange={(e) => setCustomText(e.target.value.toUpperCase())}
                      placeholder="TEAM NAME" maxLength="20"
                      className="w-full px-3 py-2.5 border border-gray-200 text-sm font-bold text-[#111] focus:outline-none focus:border-[#111]" />
                    <p className="text-[9px] text-gray-300 mt-1">{customText.length}/20 characters</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Jersey Number</label>
                    <input type="text" value={jerseyNumber} onChange={(e) => setJerseyNumber(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="24" maxLength="3"
                      className="w-24 px-3 py-2.5 border border-gray-200 text-sm font-bold text-[#111] text-center focus:outline-none focus:border-[#111]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Font Family</label>
                    <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 text-sm text-[#111] bg-white focus:outline-none focus:border-[#111]">
                      {FONTS.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Layout Comments (Optional)</label>
                    <textarea value={jerseyLayoutComments} onChange={(e) => setJerseyLayoutComments(e.target.value)}
                      rows="4" maxLength="200" placeholder="Notes about jersey layout, design placement, size preferences, etc."
                      className="w-full px-3 py-2.5 border border-gray-200 text-sm text-[#111] focus:outline-none focus:border-[#111] resize-none" />
                    <p className="text-[9px] text-gray-300 mt-1">{jerseyLayoutComments.length}/200 characters</p>
                  </div>
                  {selectedProduct && (
                    <div className="bg-gray-50 px-4 py-3 border border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Est. Price</span><span className="font-black text-[#111]">₱{totalPrice}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <h2 className="text-base font-black text-[#111] uppercase tracking-wide">Logo / Image</h2>
                  <div className="border-2 border-dashed border-gray-200 p-10 text-center cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => document.getElementById('logoInput').click()}>
                    <div className="flex justify-center mb-3 text-gray-300"><UploadIcon /></div>
                    <p className="text-xs font-bold text-gray-400 mb-1">Drop Artwork Here</p>
                    <p className="text-[10px] text-gray-300 mb-4">PNG, JPG, GIF, SVG — Max 5MB</p>
                    <span className="px-5 py-2 border border-gray-300 text-[11px] font-bold uppercase tracking-wide text-[#111] hover:bg-gray-100 transition inline-block">
                      Browse Files
                    </span>
                    <input type="file" accept="image/*" id="logoInput" className="hidden" onChange={handleLogoUpload} />
                  </div>
                  {logoFile && (
                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-100 px-3 py-2">
                      <CheckIcon /><span className="truncate font-medium">{logoFile.name}</span>
                    </div>
                  )}
                  {logoPreview && (
                    <div className="border border-gray-100 p-3 bg-gray-50">
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2 font-bold">Preview</p>
                      <img src={logoPreview} alt="Preview" className="w-full object-contain" style={{ maxHeight: 140 }} />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4 */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <h2 className="text-base font-black text-[#111] uppercase tracking-wide">Customer Details</h2>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Phone Number *</label>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+63 9xx xxx xxxx"
                      className="w-full px-3 py-2.5 border border-gray-200 text-sm text-[#111] focus:outline-none focus:border-[#111]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Order Type</label>
                    <div className="space-y-2">
                      {[['pickup', 'Pick Up', 'Collect from our store'], ['shipping', 'Ship to Address', 'Deliver to my location']].map(([val, label, sub]) => (
                        <label key={val} className={`flex items-start gap-3 p-3 border cursor-pointer transition ${orderType === val ? 'border-[#111] bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <input type="radio" name="orderType" value={val} checked={orderType === val} onChange={() => setOrderType(val)} className="mt-0.5 w-4 h-4" />
                          <div><p className="text-sm font-bold text-[#111]">{label}</p><p className="text-xs text-gray-400">{sub}</p></div>
                        </label>
                      ))}
                    </div>
                  </div>
                  {orderType === 'shipping' && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Shipping Address</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ['First Name *', 'firstName'], ['Last Name *', 'lastName'],
                        ].map(([ph, key]) => (
                          <input key={key} type="text" placeholder={ph} value={shippingAddress[key]}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, [key]: e.target.value })}
                            className="px-3 py-2.5 border border-gray-200 text-sm text-[#111] focus:outline-none focus:border-[#111]" />
                        ))}
                        <input type="text" placeholder="Company (Optional)" value={shippingAddress.company}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, company: e.target.value })}
                          className="col-span-2 px-3 py-2.5 border border-gray-200 text-sm text-[#111] focus:outline-none focus:border-[#111]" />
                        <input type="text" placeholder="Street Address *" value={shippingAddress.street}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                          className="col-span-2 px-3 py-2.5 border border-gray-200 text-sm text-[#111] focus:outline-none focus:border-[#111]" />
                        <input type="text" placeholder="City *" value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className="px-3 py-2.5 border border-gray-200 text-sm text-[#111] focus:outline-none focus:border-[#111]" />
                        <input type="text" placeholder="State/Province *" value={shippingAddress.stateProvince}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, stateProvince: e.target.value })}
                          className="px-3 py-2.5 border border-gray-200 text-sm text-[#111] focus:outline-none focus:border-[#111]" />
                        <input type="text" placeholder="ZIP/Postal Code *" value={shippingAddress.zipCode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                          className="px-3 py-2.5 border border-gray-200 text-sm text-[#111] focus:outline-none focus:border-[#111]" />
                      </div>
                    </div>
                  )}
                  {selectedProduct && (
                    <div className="bg-gray-50 px-4 py-3 border border-gray-100">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Est. Price</span><span className="font-black text-[#111]">₱{totalPrice}</span>
                      </div>
                      <p className="text-[9px] text-gray-400">{quantity} unit(s) × ₱{selectedProduct.price}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Nav buttons */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-white shrink-0">
              <button onClick={prevStep} disabled={currentStep === 1}
                className="px-4 py-2 border border-gray-200 text-sm font-medium text-[#111] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                ← Back
              </button>
              <button onClick={nextStep}
                className="px-6 py-2.5 bg-[#111] text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition flex items-center gap-2">
                {currentStep === 4 ? <><CartIcon /> Review Order</> : 'Next →'}
              </button>
            </div>
          </div>

          {/* ── RIGHT: Preview ──────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <DesignPreview
              selectedProduct={selectedProduct}
              primary={primaryColor}
              accent={accentColor}
              text={customText}
              number={jerseyNumber}
              logo={logoPreview}
              quantity={quantity}
            />
          </div>
        </div>
      </div>
    </div>
  );
}