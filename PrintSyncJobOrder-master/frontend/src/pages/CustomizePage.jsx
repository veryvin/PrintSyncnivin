import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

// ── Icons ────────────────────────────────────────────────────────────────────
const ColorsIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
  </svg>
);
const TextIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8M4 18h12" />
  </svg>
);
const UploadIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);
const RotateLeftIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" />
  </svg>
);
const RotateRightIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
  </svg>
);
const CartIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);
const SaveIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-8H7v8M7 3v5h8" />
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

// ── Jersey SVG — Back ────────────────────────────────────────────────────────
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
const COLOR_PALETTE_1 = ['#000000', '#ffffff', '#1a1a1a', '#808080', '#cccccc', '#ff0000', '#0000ff', '#008000'];
const COLOR_PALETTE_2 = ['#000000', '#ffffff', '#f5e6a3', '#f97316', '#ffff00', '#ffcc00', '#ff0000', '#0000ff'];
const COLOR_PALETTE_EXTRA = [
  '#ffffff', '#ff6600', '#00cc00', '#ffff00',
  '#ff00ff', '#00ffff', '#ff6600', '#ff99cc',
  '#99ccff',
];
const FONTS = ['INDUSTRIAL SANS', 'IMPACT', 'ARIAL BLACK', 'BEBAS NEUE', 'OSWALD'];

export default function CustomizePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const [activeTab, setActiveTab] = useState('colors');
  const [viewSide, setViewSide] = useState('front');

  const [primaryColor, setPrimaryColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#f5e6a3');
  const [color1, setColor1] = useState('#ffffff');
  const [color2, setColor2] = useState('#ffffff');
  const [color3, setColor3] = useState('#ffffff');

  const [customText, setCustomText] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('24');
  const [fontFamily, setFontFamily] = useState('INDUSTRIAL SANS');
  const [jerseyLayoutComments, setJerseyLayoutComments] = useState('');

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [quantity, setQuantity] = useState(1);
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

  const handlePlaceOrder = async () => {
    if (!selectedProduct) { toast.error('Please select a product'); return; }
    if (!quantity || quantity < 1) { toast.error('Please enter a valid quantity'); return; }
    if (!phoneNumber.trim()) { toast.error('Please enter your phone number'); return; }
    if (orderType === 'shipping') {
      const { firstName, lastName, street, city, stateProvince, zipCode } = shippingAddress;
      if (!firstName || !lastName || !street || !city || !stateProvince || !zipCode) {
        toast.error('Please fill out all shipping address fields'); return;
      }
    }
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

  // ── Color Swatch Picker ──────────────────────────────────────────────────
  const ColorSwatch = ({ palette, selected, onSelect }) => (
    <div className="grid grid-cols-4 gap-1.5">
      {palette.map(color => (
        <button key={color} onClick={() => onSelect(color)}
          className={`w-full aspect-square border-2 transition ${selected === color ? 'border-[#111] scale-110' : 'border-transparent'}`}
          style={{ backgroundColor: color, boxShadow: color === '#ffffff' ? 'inset 0 0 0 1px #ddd' : '' }}
        />
      ))}
    </div>
  );

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[#111]" />
    </div>
  );

  // ── REVIEW PAGE ──────────────────────────────────────────────────────────
  if (showReview) return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white border border-gray-200 p-8">
          <h2 className="text-2xl font-black text-[#111] uppercase mb-6">Review Your Order</h2>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Product</span>
              <span className="text-sm font-bold">{selectedProduct?.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Colors</span>
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: primaryColor }} />
                <div className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: accentColor }} />
                <div className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: color1 }} />
                <div className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: color2 }} />
                <div className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: color3 }} />
              </div>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Text</span>
              <span className="text-sm font-bold">{customText || 'TEAM NAME'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Number</span>
              <span className="text-sm font-bold">{jerseyNumber || '24'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Logo</span>
              <span className="text-sm font-bold">{logoFile ? '✓ Uploaded' : 'None'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Quantity</span>
              <span className="text-sm font-bold">{quantity} unit(s)</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Phone</span>
              <span className="text-sm font-bold">{phoneNumber}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Order Type</span>
              <span className="text-sm font-bold capitalize">{orderType === 'pickup' ? 'Pick Up' : 'Shipping'}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 mb-6">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-500">Unit Price</span>
              <span>₱{selectedProduct?.price}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-500">Quantity</span>
              <span>{quantity}x</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="font-bold">Total</span>
              <span className="text-2xl font-black text-[#111]">₱{totalPrice}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={handlePlaceOrder} disabled={isSubmitting}
              className="w-full py-3 bg-[#111] text-white font-bold text-sm uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition">
              {isSubmitting ? 'Placing Order...' : '✓ Confirm & Place Order'}
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

  // ── MAIN CUSTOMIZE PAGE ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-black text-[#111] uppercase mb-1">Design Studio</h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">Configure your garment specifications</p>

        <div className="flex gap-6">

          {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
          <div className="w-[200px] shrink-0">
            <div className="bg-white border border-gray-200">

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                {[
                  { key: 'colors', label: 'Colors', icon: <ColorsIcon /> },
                  { key: 'text', label: 'Text', icon: <TextIcon /> },
                  { key: 'upload', label: 'Upload', icon: <UploadIcon /> },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 text-[0.6rem] font-bold uppercase tracking-wide transition ${
                      activeTab === tab.key ? 'bg-[#111] text-white' : 'text-gray-500 hover:bg-gray-50'
                    }`}>
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Product selector */}
              <div className="p-3 border-b border-gray-100">
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => setSelectedProduct(products.find(p => p.id === e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-200 text-xs text-[#111] focus:outline-none focus:border-[#111]"
                >
                  <option value="">Select product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — ₱{p.price}</option>
                  ))}
                </select>
              </div>

              {/* ── COLORS TAB ─────────────────────────────────────────── */}
              {activeTab === 'colors' && (
                <div className="p-3 space-y-4">
                  <div>
                    <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-wider mb-2">Primary Base Color</p>
                    <ColorSwatch palette={COLOR_PALETTE_1} selected={primaryColor} onSelect={setPrimaryColor} />
                  </div>
                  <div>
                    <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-wider mb-2">Accent Color</p>
                    <ColorSwatch palette={COLOR_PALETTE_2} selected={accentColor} onSelect={setAccentColor} />
                  </div>

                  {/* Additional Colors */}
                  <div>
                    <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-wider mb-2">Additional Colors (Optional)</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[0.55rem] text-gray-400 uppercase tracking-wider mb-1">Color 1</p>
                        <ColorSwatch palette={COLOR_PALETTE_EXTRA} selected={color1} onSelect={setColor1} />
                      </div>
                      <div>
                        <p className="text-[0.55rem] text-gray-400 uppercase tracking-wider mb-1">Color 2</p>
                        <ColorSwatch palette={COLOR_PALETTE_EXTRA} selected={color2} onSelect={setColor2} />
                      </div>
                      <div>
                        <p className="text-[0.55rem] text-gray-400 uppercase tracking-wider mb-1">Color 3</p>
                        <ColorSwatch palette={COLOR_PALETTE_EXTRA} selected={color3} onSelect={setColor3} />
                      </div>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-wider mb-2">Quantity</p>
                    <input type="number" min="1" max="100" value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                      className="w-full px-2 py-1.5 border border-gray-200 text-sm text-[#111] focus:outline-none focus:border-[#111]"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-wider mb-2">Phone *</p>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+63 9xx xxx xxxx"
                      className="w-full px-2 py-1.5 border border-gray-200 text-xs text-[#111] focus:outline-none focus:border-[#111]"
                    />
                  </div>

                  {/* Order type */}
                  <div>
                    <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-wider mb-2">Order Type</p>
                    <div className="space-y-1">
                      {[['pickup', 'Pick Up'], ['shipping', 'Shipping']].map(([val, label]) => (
                        <label key={val} className={`flex items-center gap-2 p-2 border cursor-pointer text-xs transition ${orderType === val ? 'border-[#111] bg-gray-50' : 'border-gray-200'}`}>
                          <input type="radio" name="orderType" value={val} checked={orderType === val} onChange={() => setOrderType(val)} className="w-3 h-3" />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Shipping address */}
                  {orderType === 'shipping' && (
                    <div className="space-y-2">
                      <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-wider">Shipping Address</p>
                      {[
                        ['firstName', 'First Name *'],
                        ['lastName', 'Last Name *'],
                        ['street', 'Street *'],
                        ['city', 'City *'],
                        ['stateProvince', 'Province *'],
                        ['zipCode', 'ZIP *'],
                      ].map(([field, placeholder]) => (
                        <input key={field} type="text" placeholder={placeholder}
                          value={shippingAddress[field]}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, [field]: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-200 text-xs focus:outline-none focus:border-[#111]"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TEXT TAB ───────────────────────────────────────────── */}
              {activeTab === 'text' && (
                <div className="p-3 space-y-4">
                  <div>
                    <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-wider mb-2">Custom Text</p>
                    <input type="text" value={customText}
                      onChange={(e) => setCustomText(e.target.value.toUpperCase())}
                      placeholder="PRINTSYNC" maxLength="20"
                      className="w-full px-2 py-1.5 border border-gray-200 text-sm font-bold text-[#111] focus:outline-none focus:border-[#111]"
                    />
                  </div>
                  <div>
                    <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-wider mb-2">Jersey Number</p>
                    <input type="text" value={jerseyNumber}
                      onChange={(e) => setJerseyNumber(e.target.value.replace(/\D/, '').slice(0, 2))}
                      placeholder="24" maxLength="2"
                      className="w-full px-2 py-1.5 border border-gray-200 text-sm font-bold text-[#111] focus:outline-none focus:border-[#111]"
                    />
                  </div>
                  <div>
                    <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-wider mb-2">Font Family</p>
                    <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 text-xs text-[#111] focus:outline-none focus:border-[#111]">
                      {FONTS.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <button className="w-full py-2 border border-gray-300 text-xs font-bold uppercase tracking-wide text-[#111] hover:bg-gray-50 transition flex items-center justify-center gap-2">
                    <TextIcon /> Add Text Layer
                  </button>
                  <div>
                    <p className="text-[0.6rem] font-bold text-gray-500 uppercase tracking-wider mb-2">Layout Notes</p>
                    <textarea value={jerseyLayoutComments} onChange={(e) => setJerseyLayoutComments(e.target.value)}
                      rows="3" maxLength="200" placeholder="Notes about placement..."
                      className="w-full px-2 py-1.5 border border-gray-200 text-xs text-[#111] focus:outline-none focus:border-[#111] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* ── UPLOAD TAB ─────────────────────────────────────────── */}
              {activeTab === 'upload' && (
                <div className="p-3 space-y-3">
                  <div className="border-2 border-dashed border-gray-300 p-6 text-center">
                    <UploadIcon />
                    <p className="text-[0.6rem] text-gray-400 mt-2 mb-3">PNG, JPG, SVG (Max 5MB)</p>
                    <p className="text-[0.6rem] font-bold text-gray-500 mb-3">Drop Artwork Here</p>
                    <input type="file" accept="image/*" id="logoInput" className="hidden" onChange={handleLogoUpload} />
                    <label htmlFor="logoInput">
                      <button type="button" onClick={() => document.getElementById('logoInput').click()}
                        className="w-full py-2 border border-gray-300 text-xs font-bold uppercase tracking-wide text-[#111] hover:bg-gray-50 transition">
                        Browse Files
                      </button>
                    </label>
                  </div>
                  {logoFile && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <span>✓</span> <span className="truncate">{logoFile.name}</span>
                    </div>
                  )}
                  {logoPreview && (
                    <img src={logoPreview} alt="Preview" className="w-full object-contain border border-gray-200 p-2" style={{ maxHeight: 120 }} />
                  )}
                </div>
              )}

              {/* Price + Buttons */}
              <div className="p-3 border-t border-gray-200">
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-[0.6rem] text-gray-400 uppercase tracking-wider">Est. Price</span>
                  <span className="text-lg font-black text-[#111]">₱{totalPrice}</span>
                </div>
                <button onClick={() => {
                  if (!selectedProduct) { toast.error('Please select a product'); return; }
                  if (!phoneNumber.trim()) { toast.error('Please enter your phone number'); return; }
                  setShowReview(true);
                }}
                  className="w-full py-2.5 bg-[#111] text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition flex items-center justify-center gap-2 mb-2">
                  <CartIcon /> Add to Cart
                </button>
                <button className="w-full py-2 border border-gray-200 text-xs font-bold uppercase tracking-wide text-gray-500 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <SaveIcon /> Save Design
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL — Preview ───────────────────────────────────── */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="flex gap-2">
                  <button onClick={() => setViewSide('front')}
                    className={`w-8 h-8 flex items-center justify-center border transition ${viewSide === 'front' ? 'bg-[#111] border-[#111] text-white' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
                    <RotateLeftIcon />
                  </button>
                  <button onClick={() => setViewSide('back')}
                    className={`w-8 h-8 flex items-center justify-center border transition ${viewSide === 'back' ? 'bg-[#111] border-[#111] text-white' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
                    <RotateRightIcon />
                  </button>
                </div>
                <span className="text-[0.6rem] text-gray-400 uppercase tracking-widest">
                  {viewSide === 'front' ? 'Front View' : 'Back View'}
                </span>
                <button className="px-3 py-1.5 border border-gray-300 text-[0.6rem] font-bold uppercase tracking-wide text-gray-500 hover:bg-gray-50 transition">
                  Print Size
                </button>
              </div>

              <div className="flex items-center justify-center bg-gray-50 p-8" style={{ minHeight: 420 }}>
                {selectedProduct ? (
                  <div className="w-64">
                    {viewSide === 'front' ? (
                      <JerseyFront
                        primaryColor={primaryColor}
                        accentColor={accentColor}
                        customText={customText}
                        number={jerseyNumber}
                        logoPreview={logoPreview}
                      />
                    ) : (
                      <JerseyBack
                        primaryColor={primaryColor}
                        accentColor={accentColor}
                        number={jerseyNumber}
                      />
                    )}
                    <p className="text-center text-xs text-gray-400 mt-4 uppercase tracking-wider">{selectedProduct.name}</p>
                    <p className="text-center text-xs text-gray-400 uppercase tracking-wider">
                      {quantity} unit(s) @ ₱{selectedProduct.price}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-300 text-4xl mb-3">👕</p>
                    <p className="text-sm text-gray-400">Select a product to start designing</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-3 border-t border-gray-100 flex gap-4">
                {['Design preview is approximate', 'Final product may vary', 'Admin will review your order'].map((note, i) => (
                  <p key={i} className="text-[0.6rem] text-gray-400">• {note}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}