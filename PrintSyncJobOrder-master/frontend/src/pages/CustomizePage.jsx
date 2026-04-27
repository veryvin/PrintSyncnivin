import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

// ── Icons ────────────────────────────────────────────────────────────────────
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

// ── Jersey SVG — Front ───────────────────────────────────────────────────────
const JerseyFront = ({ primaryColor, accentColor, customText, number, logoPreview }) => (
  <svg viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
    <path d="M75 60 L30 90 L20 150 L60 155 L60 320 L240 320 L240 155 L280 150 L270 90 L225 60 C210 80 90 80 75 60Z"
      fill={primaryColor} stroke={accentColor} strokeWidth="3" />
    <path d="M120 60 Q150 85 180 60" fill="none" stroke={accentColor} strokeWidth="3" />
    <path d="M75 60 L30 90 L20 150 L60 155 L60 100Z" fill={accentColor} opacity="0.3" />
    <path d="M225 60 L270 90 L280 150 L240 155 L240 100Z" fill={accentColor} opacity="0.3" />
    <rect x="60" y="155" width="12" height="165" fill={accentColor} opacity="0.5" />
    <rect x="228" y="155" width="12" height="165" fill={accentColor} opacity="0.5" />
    {logoPreview ? (
      <image href={logoPreview} x="125" y="75" width="50" height="50" preserveAspectRatio="xMidYMid meet" />
    ) : (
      <circle cx="150" cy="100" r="18" fill="none" stroke={accentColor} strokeWidth="1.5" opacity="0.5" />
    )}
    <text x="150" y="195" textAnchor="middle" fill={accentColor} fontSize="22" fontWeight="900"
      fontFamily="'Arial Black', sans-serif" letterSpacing="2">
      {customText || 'TEAM NAME'}
    </text>
    <text x="150" y="275" textAnchor="middle" fill={accentColor} fontSize="72" fontWeight="900"
      fontFamily="'Arial Black', sans-serif">
      {number || '24'}
    </text>
    <rect x="60" y="315" width="180" height="5" fill={accentColor} />
  </svg>
);

const JerseyBack = ({ primaryColor, accentColor, number }) => (
  <svg viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
    <path d="M75 60 L30 90 L20 150 L60 155 L60 320 L240 320 L240 155 L280 150 L270 90 L225 60 C210 80 90 80 75 60Z"
      fill={primaryColor} stroke={accentColor} strokeWidth="3" />
    <path d="M75 60 L30 90 L20 150 L60 155 L60 100Z" fill={accentColor} opacity="0.3" />
    <path d="M225 60 L270 90 L280 150 L240 155 L240 100Z" fill={accentColor} opacity="0.3" />
    <rect x="60" y="155" width="12" height="165" fill={accentColor} opacity="0.5" />
    <rect x="228" y="155" width="12" height="165" fill={accentColor} opacity="0.5" />
    <text x="150" y="165" textAnchor="middle" fill={accentColor} fontSize="20" fontWeight="900"
      fontFamily="'Arial Black', sans-serif" letterSpacing="2">
      SURNAME
    </text>
    <text x="150" y="275" textAnchor="middle" fill={accentColor} fontSize="72" fontWeight="900"
      fontFamily="'Arial Black', sans-serif">
      {number || '24'}
    </text>
    <rect x="60" y="315" width="180" height="5" fill={accentColor} />
  </svg>
);

// ── Color Palettes ────────────────────────────────────────────────────────────
const COLOR_PALETTE_1 = ['#000000', '#1a1a1a', '#808080', '#cccccc', '#ffffff', '#ff0000', '#0000ff', '#008000', '#ff69b4', '#ffc0cb'];
const COLOR_PALETTE_2 = ['#000000', '#1a1a1a', '#ffffff', '#f5e6a3', '#f97316', '#ffff00', '#ffcc00', '#ff0000', '#0000ff', '#00cc00'];
const COLOR_PALETTE_EXTRA = ['#ffffff', '#ff6600', '#00cc00', '#ffff00', '#ff00ff', '#00ffff', '#ff99cc', '#99ccff', '#ff6600'];
const FONTS = ['INDUSTRIAL SANS', 'IMPACT', 'ARIAL BLACK', 'BEBAS NEUE', 'OSWALD'];

// ── Step Indicator ────────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep, completedSteps }) => {
  const steps = [
    { num: 1, label: 'Colors & Quantity' },
    { num: 2, label: 'Text' },
    { num: 3, label: 'Logo/Image' },
    { num: 4, label: 'Customer Details' },
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

// ── Color Swatch Picker ───────────────────────────────────────────────────────
const ColorSwatch = ({ palette, selected, onSelect }) => (
  <div className="flex flex-wrap gap-2">
    {palette.map(color => (
      <button
        key={color}
        onClick={() => onSelect(color)}
        title={color}
        className={`w-8 h-8 rounded transition-all ${selected === color ? 'ring-2 ring-offset-2 ring-[#111] scale-110 shadow-md' : 'hover:scale-105 hover:shadow-sm'}`}
        style={{
          backgroundColor: color,
          border: ['#ffffff', '#cccccc', '#f5e6a3', '#ffff00', '#ffc0cb', '#ff99cc'].includes(color)
            ? '1px solid #ddd' : '1px solid transparent',
        }}
      />
    ))}
  </div>
);

// ── Design Preview Panel ──────────────────────────────────────────────────────
const DesignPreview = ({ selectedProduct, primaryColor, accentColor, customText, jerseyNumber, logoPreview, quantity }) => {
  const [viewSide, setViewSide] = useState('front');
  return (
    <div className="bg-white border border-gray-200 flex flex-col" style={{ height: '100%' }}>
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Design Preview</p>
        <div className="flex gap-1">
          {['front', 'back'].map(side => (
            <button key={side} onClick={() => setViewSide(side)}
              className={`px-3 py-1 text-xs font-bold uppercase border transition ${viewSide === side ? 'bg-[#111] text-white border-[#111]' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
              {side}
            </button>
          ))}
        </div>
      </div>

      {/* Jersey Canvas — fills all available space */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        {selectedProduct ? (
          <div style={{ width: '280px', height: '336px' }}>
            {viewSide === 'front' ? (
              <JerseyFront primaryColor={primaryColor} accentColor={accentColor} customText={customText} number={jerseyNumber} logoPreview={logoPreview} />
            ) : (
              <JerseyBack primaryColor={primaryColor} accentColor={accentColor} number={jerseyNumber} />
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-200 text-7xl mb-4">👕</p>
            <p className="text-sm text-gray-300 font-medium">Select a product to start designing</p>
          </div>
        )}
      </div>

      {/* Footer info */}
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

// ════════════════════════════════════════════════════════════════════════════
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

  // Colors & Quantity
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

  // Customer Details
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
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
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

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

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
          logoImage: logoPreview || null
        },
        totalPrice: parseFloat(totalPrice),
        status: 'pending',
      });
      toast.success('Order placed! Admin will review it soon.');
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

  // ── REVIEW PAGE ───────────────────────────────────────────────────────────
  if (showReview) return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white border border-gray-200 p-8">
          <h2 className="text-2xl font-black text-[#111] uppercase mb-6">Review Your Order</h2>
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
          <div className="bg-gray-50 p-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Unit Price</span><span>₱{selectedProduct?.price}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Quantity</span><span>{quantity}x</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="font-bold">Total</span>
              <span className="text-2xl font-black text-[#111]">₱{totalPrice}</span>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={handlePlaceOrder} disabled={isSubmitting}
              className="w-full py-3 bg-[#111] text-white font-bold text-sm uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition flex items-center justify-center gap-2">
              <CartIcon /> {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
            </button>
            <button onClick={() => setShowReview(false)}
              className="w-full py-2 border border-gray-300 text-[#111] font-medium text-sm hover:bg-gray-50 transition">
              ← Back to Design
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── MAIN PAGE ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">

        <h1 className="text-3xl font-black text-[#111] uppercase mb-1">Design Studio</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">Configure your custom apparel specifications</p>

        <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

        {/* Two-column layout */}
        <div className="flex gap-6" style={{ minHeight: '680px' }}>

          {/* ── LEFT: Step Form — fixed width ──────────────────────────── */}
          <div className="bg-white border border-gray-200 flex flex-col" style={{ width: '420px', flexShrink: 0 }}>
            <div className="flex-1 overflow-y-auto p-6">

              {/* ── STEP 1 ─────────────────────────────────────────────── */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <h2 className="text-base font-black text-[#111] uppercase tracking-wide">Colors & Quantity</h2>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Select Product</label>
                    <select
                      value={selectedProduct?.id || ''}
                      onChange={(e) => setSelectedProduct(products.find(p => p.id === e.target.value))}
                      className="w-full px-3 py-2.5 border border-gray-200 text-sm text-[#111] bg-white focus:outline-none focus:border-[#111]">
                      <option value="">Choose a product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} — ₱{p.price}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                      Primary Base Color
                      {primaryColor && <span className="ml-2 normal-case font-normal text-gray-300 text-[9px]">{primaryColor}</span>}
                    </label>
                    <div className="p-3 bg-gray-50 border border-gray-100">
                      <ColorSwatch palette={COLOR_PALETTE_1} selected={primaryColor} onSelect={setPrimaryColor} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                      Accent Color
                      {accentColor && <span className="ml-2 normal-case font-normal text-gray-300 text-[9px]">{accentColor}</span>}
                    </label>
                    <div className="p-3 bg-gray-50 border border-gray-100">
                      <ColorSwatch palette={COLOR_PALETTE_2} selected={accentColor} onSelect={setAccentColor} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Additional Colors (Optional)</label>
                    <div className="space-y-2">
                      {[['Color 1', color1, setColor1], ['Color 2', color2, setColor2], ['Color 3', color3, setColor3]].map(([label, val, setter]) => (
                        <div key={label} className="p-3 bg-gray-50 border border-gray-100">
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2 font-bold">{label}</p>
                          <ColorSwatch palette={COLOR_PALETTE_EXTRA} selected={val} onSelect={setter} />
                        </div>
                      ))}
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

              {/* ── STEP 2 ─────────────────────────────────────────────── */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <h2 className="text-base font-black text-[#111] uppercase tracking-wide">Text</h2>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Custom Text</label>
                    <input type="text" value={customText}
                      onChange={(e) => setCustomText(e.target.value.toUpperCase())}
                      placeholder="TEAM NAME" maxLength="20"
                      className="w-full px-3 py-2.5 border border-gray-200 text-sm font-bold text-[#111] focus:outline-none focus:border-[#111]" />
                    <p className="text-[9px] text-gray-300 mt-1">{customText.length}/20 characters</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Jersey Number</label>
                    <input type="text" value={jerseyNumber}
                      onChange={(e) => setJerseyNumber(e.target.value.replace(/\D/g, '').slice(0, 3))}
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
                      rows="4" maxLength="200"
                      placeholder="Notes about jersey layout, design placement, size preferences, etc."
                      className="w-full px-3 py-2.5 border border-gray-200 text-sm text-[#111] focus:outline-none focus:border-[#111] resize-none" />
                    <p className="text-[9px] text-gray-300 mt-1">{jerseyLayoutComments.length}/200 characters</p>
                  </div>

                  {selectedProduct && (
                    <div className="bg-gray-50 px-4 py-3 border border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Est. Price</span>
                        <span className="font-black text-[#111]">₱{totalPrice}</span>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-0.5">{quantity} unit(s) × ₱{selectedProduct.price}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 3 ─────────────────────────────────────────────── */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <h2 className="text-base font-black text-[#111] uppercase tracking-wide">Logo / Image</h2>

                  <div
                    className="border-2 border-dashed border-gray-200 p-10 text-center cursor-pointer hover:bg-gray-50 transition"
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

                  {selectedProduct && (
                    <div className="bg-gray-50 px-4 py-3 border border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Est. Price</span>
                        <span className="font-black text-[#111]">₱{totalPrice}</span>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-0.5">{quantity} unit(s) × ₱{selectedProduct.price}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 4 ─────────────────────────────────────────────── */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <h2 className="text-base font-black text-[#111] uppercase tracking-wide">Customer Details</h2>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Phone Number *</label>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+63 9xx xxx xxxx"
                      className="w-full px-3 py-2.5 border border-gray-200 text-sm text-[#111] focus:outline-none focus:border-[#111]" />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Order Type</label>
                    <div className="space-y-2">
                      {[['pickup', 'Pick Up', 'Collect from our store'], ['shipping', 'Ship to Address', 'Deliver to my location']].map(([val, label, sub]) => (
                        <label key={val} className={`flex items-start gap-3 p-3 border cursor-pointer transition ${orderType === val ? 'border-[#111] bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <input type="radio" name="orderType" value={val} checked={orderType === val} onChange={() => setOrderType(val)} className="mt-0.5 w-4 h-4" />
                          <div>
                            <p className="text-sm font-bold text-[#111]">{label}</p>
                            <p className="text-xs text-gray-400">{sub}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {orderType === 'shipping' && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Shipping Address</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="First Name *" value={shippingAddress.firstName}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                          className="px-3 py-2.5 border border-gray-200 text-sm text-[#111] focus:outline-none focus:border-[#111]" />
                        <input type="text" placeholder="Last Name *" value={shippingAddress.lastName}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                          className="px-3 py-2.5 border border-gray-200 text-sm text-[#111] focus:outline-none focus:border-[#111]" />
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
                        <span className="text-gray-500">Est. Price</span>
                        <span className="font-black text-[#111]">₱{totalPrice}</span>
                      </div>
                      <p className="text-[9px] text-gray-400">{quantity} unit(s) × ₱{selectedProduct.price}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Nav buttons pinned to bottom of form panel ─────────── */}
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

          {/* ── RIGHT: Preview — fills all remaining space ──────────────── */}
          <div className="flex-1 min-w-0">
            <DesignPreview
              selectedProduct={selectedProduct}
              primaryColor={primaryColor}
              accentColor={accentColor}
              customText={customText}
              jerseyNumber={jerseyNumber}
              logoPreview={logoPreview}
              quantity={quantity}
            />
          </div>

        </div>
      </div>
    </div>
  );
}