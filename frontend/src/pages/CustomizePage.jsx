import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

export default function CustomizePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Step 1: Color Palettes + Quantity
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [accentColor, setAccentColor] = useState('#FFFFFF');
  const [additionalColor1, setAdditionalColor1] = useState('');
  const [additionalColor2, setAdditionalColor2] = useState('');
  const [additionalColor3, setAdditionalColor3] = useState('');
  const [quantity, setQuantity] = useState('');
  
  // Step 2: Text
  const [customText, setCustomText] = useState('');
  const [jerseyLayoutComments, setJerseyLayoutComments] = useState('');
  
  // Step 3: Logo/Image
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  // Step 4: Customer Details
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderType, setOrderType] = useState('pickup'); // pickup or shipping
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    company: '',
    street: '',
    city: '',
    stateProvince: '',
    zipCode: '',
  });
  
  // Order details
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    fetchProducts();
    if (location.state?.selectedProduct) {
      setSelectedProduct(location.state.selectedProduct);
    }
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      const qty = quantity === '' ? 0 : quantity;
      setTotalPrice((selectedProduct.price * qty).toFixed(2));
    }
  }, [selectedProduct, quantity]);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load products');
      setLoading(false);
    }
  };

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas and compress
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize to max 800x800 while maintaining aspect ratio
        const maxSize = 800;
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression (quality 0.7)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        callback(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setLogoFile(file);
      
      // Compress and create preview
      compressImage(file, (compressedBase64) => {
        setLogoPreview(compressedBase64);
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    if (quantity === '' || quantity < 1 || quantity > 100) {
      toast.error('Quantity must be between 1 and 100');
      return;
    }

    if (!phoneNumber || phoneNumber.trim() === '') {
      toast.error('Please enter your phone number');
      return;
    }

    if (orderType === 'shipping') {
      const { firstName, lastName, street, city, stateProvince, zipCode } = shippingAddress;
      if (!firstName || !lastName || !street || !city || !stateProvince || !zipCode) {
        toast.error('Please fill out all required shipping address fields');
        return;
      }
    }

    if (step !== 5) {
      toast.error('Complete all steps and review');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        userId: user.uid,
        customerName: user.displayName || user.email,
        customerEmail: user.email,
        phoneNumber,
        orderType,
        shippingAddress: orderType === 'shipping' ? shippingAddress : null,
        items: [{
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity: parseInt(quantity),
          price: selectedProduct.price,
        }],
        customizationDetails: {
          primaryColor,
          accentColor,
          additionalColors: {
            color1: additionalColor1,
            color2: additionalColor2,
            color3: additionalColor3,
          },
          customText,
          jerseyLayoutComments,
          logoImage: logoPreview || null,
        },
        totalPrice: parseFloat(totalPrice),
        status: 'pending',
      };

      await apiClient.post('/orders', orderData);
      toast.success('Order placed successfully! Admin will review it soon.');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to place order: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-primary mb-2">Design Studio</h1>
        <p className="text-gray-600 mb-8">Configure your custom apparel specifications</p>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary"></div>
          </div>
        ) : step === 5 ? (
          /* Step 5: Review & Confirmation */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg border border-border p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">Review Your Order</h2>
              
              {/* Product Selection */}
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-xs text-gray-600 mb-2">PRODUCT</p>
                <p className="text-lg font-semibold text-primary">{selectedProduct?.name}</p>
                <p className="text-sm text-gray-600">₱{selectedProduct?.price}</p>
              </div>

              {/* Colors Review */}
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-xs text-gray-600 mb-4">COLORS</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded border-2 border-gray-300 mb-2"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="text-xs text-gray-600">Primary</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded border-2 border-gray-300 mb-2"
                      style={{ backgroundColor: accentColor }}
                    />
                    <span className="text-xs text-gray-600">Accent</span>
                  </div>
                  {additionalColor1 && (
                    <div className="flex flex-col items-center">
                      <div
                        className="w-12 h-12 rounded border-2 border-gray-300 mb-2"
                        style={{ backgroundColor: additionalColor1 }}
                      />
                      <span className="text-xs text-gray-600">Add. 1</span>
                    </div>
                  )}
                  {additionalColor2 && (
                    <div className="flex flex-col items-center">
                      <div
                        className="w-12 h-12 rounded border-2 border-gray-300 mb-2"
                        style={{ backgroundColor: additionalColor2 }}
                      />
                      <span className="text-xs text-gray-600">Add. 2</span>
                    </div>
                  )}
                  {additionalColor3 && (
                    <div className="flex flex-col items-center">
                      <div
                        className="w-12 h-12 rounded border-2 border-gray-300 mb-2"
                        style={{ backgroundColor: additionalColor3 }}
                      />
                      <span className="text-xs text-gray-600">Add. 3</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Review */}
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-xs text-gray-600 mb-2">TEXT</p>
                <p className="text-lg font-semibold text-primary">{customText || 'Not specified'}</p>
              </div>

              {/* Jersey Layout Comments Review */}
              {jerseyLayoutComments && (
                <div className="mb-6 pb-6 border-b border-border">
                  <p className="text-xs text-gray-600 mb-2">LAYOUT NOTES</p>
                  <p className="text-sm text-primary">{jerseyLayoutComments}</p>
                </div>
              )}

              {/* Logo Review */}
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-xs text-gray-600 mb-2">LOGO/IMAGE</p>
                {logoPreview ? (
                  <div className="flex items-center gap-4">
                    <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain rounded border border-border p-2" />
                    <span className="text-gray-600">{logoFile?.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-600">No logo uploaded</span>
                )}
              </div>

              {/* Quantity Review */}
              <div className="mb-8 pb-8 border-b border-border">
                <p className="text-xs text-gray-600 mb-2">QUANTITY</p>
                <p className="text-lg font-semibold text-primary">{quantity} unit(s)</p>
              </div>

              {/* Customer Details Review */}
              <div className="mb-8 pb-8 border-b border-border">
                <p className="text-xs text-gray-600 mb-3">CUSTOMER DETAILS</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600">Phone Number:</p>
                    <p className="text-sm font-medium">{phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Order Type:</p>
                    <p className="text-sm font-medium capitalize">{orderType === 'pickup' ? 'Pick Up' : 'Shipping'}</p>
                  </div>
                  {orderType === 'shipping' && (
                    <div>
                      <p className="text-xs text-gray-600">Shipping Address:</p>
                      <p className="text-sm font-medium">
                        {shippingAddress.firstName} {shippingAddress.lastName}
                      </p>
                      {shippingAddress.company && (
                        <p className="text-sm text-gray-600">{shippingAddress.company}</p>
                      )}
                      <p className="text-sm text-gray-600">{shippingAddress.street}</p>
                      <p className="text-sm text-gray-600">
                        {shippingAddress.city}, {shippingAddress.stateProvince} {shippingAddress.zipCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Summary */}
              <div className="mb-8 p-4 bg-light rounded">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-semibold">₱{selectedProduct?.price}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-semibold">{quantity}x</span>
                </div>
                <div className="flex justify-between border-t border-border pt-4">
                  <span className="font-semibold text-lg">Total:</span>
                  <span className="text-2xl font-bold text-primary">₱{totalPrice}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-primary text-white rounded font-medium hover:bg-gray-800 disabled:opacity-50 transition"
                >
                  {isSubmitting ? 'Confirming...' : '✓ Confirm & Place Order'}
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="w-full px-4 py-2 border border-border rounded font-medium text-primary hover:bg-light transition"
                >
                  ← Back to Customer Details
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Configuration */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-border overflow-hidden sticky top-24">
                {/* Step Indicator */}
                <div className="p-6 border-b border-border">
                  <div className="flex gap-4 mb-6">
                    {[1, 2, 3, 4].map(s => (
                      <button
                        key={s}
                        onClick={() => s < step && setStep(s)}
                        className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition ${
                          s === step
                            ? 'bg-primary text-white'
                            : s < step
                            ? 'bg-green-500 text-white cursor-pointer'
                            : 'bg-light text-gray-400'
                        }`}
                      >
                        {s < step ? '✓' : s}
                      </button>
                    ))}
                  </div>
                  <h3 className="font-semibold text-primary">
                    {step === 1 && 'Colors & Quantity'}
                    {step === 2 && 'Text'}
                    {step === 3 && 'Logo/Image'}
                    {step === 4 && 'Customer Details'}
                  </h3>
                </div>

                {/* Product Selection - Only in Step 1 */}
                {step === 1 && (
                  <div className="p-6 border-b border-border">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">SELECT PRODUCT</label>
                    <select
                      value={selectedProduct?.id || ''}
                      onChange={(e) => {
                        const product = products.find(p => p.id === e.target.value);
                        setSelectedProduct(product);
                      }}
                      className="w-full px-3 py-2 border border-border rounded text-sm focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Choose a product...</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ₱{product.price}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Step 1: Colors & Quantity */}
                {step === 1 && (
                  <div className="p-6 space-y-6 border-b border-border">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-3">PRIMARY BASE COLOR</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['#000000', '#ffffff', '#1a1a1a', '#808080', '#cccccc', '#ff9f9f', '#ff0000', '#0000ff'].map(color => (
                          <button
                            key={color}
                            onClick={() => setPrimaryColor(color)}
                            className={`w-full h-12 rounded border-2 transition ${
                              primaryColor === color ? 'border-secondary' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-3">ACCENT COLOR</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['#000000', '#ffffff', '#1a1a1a', '#f97316', '#ffff00', '#ffcc00', '#ff0000', '#0000ff'].map(color => (
                          <button
                            key={color}
                            onClick={() => setAccentColor(color)}
                            className={`w-full h-12 rounded border-2 transition ${
                              accentColor === color ? 'border-secondary' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-3">ADDITIONAL COLORS (OPTIONAL)</label>
                      
                      {/* Additional Color 1 */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Color 1</p>
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            key="none1"
                            onClick={() => setAdditionalColor1('')}
                            className={`w-full h-12 rounded border-2 flex items-center justify-center text-xs font-semibold transition ${
                              additionalColor1 === '' ? 'border-secondary bg-gray-100' : 'border-gray-200'
                            }`}
                            title="None"
                          >
                            -
                          </button>
                          {['#f97316', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4', '#87ceeb'].map(color => (
                            <button
                              key={color}
                              onClick={() => setAdditionalColor1(color)}
                              className={`w-full h-12 rounded border-2 transition ${
                                additionalColor1 === color ? 'border-secondary' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Additional Color 2 */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Color 2</p>
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            key="none2"
                            onClick={() => setAdditionalColor2('')}
                            className={`w-full h-12 rounded border-2 flex items-center justify-center text-xs font-semibold transition ${
                              additionalColor2 === '' ? 'border-secondary bg-gray-100' : 'border-gray-200'
                            }`}
                            title="None"
                          >
                            -
                          </button>
                          {['#f97316', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4', '#87ceeb'].map(color => (
                            <button
                              key={color}
                              onClick={() => setAdditionalColor2(color)}
                              className={`w-full h-12 rounded border-2 transition ${
                                additionalColor2 === color ? 'border-secondary' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Additional Color 3 */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Color 3</p>
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            key="none3"
                            onClick={() => setAdditionalColor3('')}
                            className={`w-full h-12 rounded border-2 flex items-center justify-center text-xs font-semibold transition ${
                              additionalColor3 === '' ? 'border-secondary bg-gray-100' : 'border-gray-200'
                            }`}
                            title="None"
                          >
                            -
                          </button>
                          {['#f97316', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4', '#87ceeb'].map(color => (
                            <button
                              key={color}
                              onClick={() => setAdditionalColor3(color)}
                              className={`w-full h-12 rounded border-2 transition ${
                                additionalColor3 === color ? 'border-secondary' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">QUANTITY</label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setQuantity('');
                          } else {
                            const numVal = parseInt(val);
                            if (numVal >= 1 && numVal <= 100) {
                              setQuantity(numVal);
                            }
                          }
                        }}
                        min="1"
                        max="100"
                        placeholder="Enter quantity (1-100)"
                        className="w-full px-3 py-2 border border-border rounded text-sm focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Text */}
                {step === 2 && (
                  <div className="p-6 space-y-4 border-b border-border">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">CUSTOM TEXT</label>
                      <input
                        type="text"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value.toUpperCase())}
                        placeholder="PRINTSYNC"
                        maxLength="30"
                        className="w-full px-3 py-2 border border-border rounded text-sm focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">JERSEY LAYOUT COMMENTS (OPTIONAL)</label>
                      <textarea
                        value={jerseyLayoutComments}
                        onChange={(e) => setJerseyLayoutComments(e.target.value)}
                        placeholder="Add any notes about jersey layout, design placement, size preferences, etc."
                        maxLength="200"
                        rows="3"
                        className="w-full px-3 py-2 border border-border rounded text-sm focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-gray-500 mt-1">{jerseyLayoutComments.length}/200 characters</p>
                    </div>

                    <div className="text-xs text-gray-600 bg-light p-3 rounded">
                      EST. PRICE: ₱{totalPrice}
                    </div>
                  </div>
                )}

                {/* Step 3: Logo/Image */}
                {step === 3 && (
                  <div className="p-6 space-y-4 border-b border-border">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-3">DROP ARTWORK HERE</label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-light">
                        <p className="text-xs text-gray-500 mb-3">PNG, JPG, GIF, SVG (Max 5MB)</p>
                        <input
                          type="file"
                          onChange={handleLogoUpload}
                          accept="image/*"
                          className="hidden"
                          id="logoInput"
                        />
                        <label htmlFor="logoInput" className="cursor-pointer">
                          <div className="text-2xl mb-2">📁</div>
                          <button
                            type="button"
                            onClick={() => document.getElementById('logoInput').click()}
                            className="w-full px-4 py-2 border border-border rounded text-sm font-medium text-primary hover:bg-light transition"
                          >
                            Browse Files
                          </button>
                        </label>
                      </div>
                      {logoFile && (
                        <p className="text-xs text-green-600 mt-2">✓ {logoFile.name}</p>
                      )}
                    </div>

                    <div className="text-xs text-gray-600 bg-light p-3 rounded">
                      EST. PRICE: ₱{totalPrice}
                    </div>
                  </div>
                )}

                {/* Step 4: Customer Details */}
                {step === 4 && (
                  <div className="p-6 space-y-6 border-b border-border">
                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">PHONE NUMBER *</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+63 9xx xxx xxxx"
                        className="w-full px-3 py-2 border border-border rounded text-sm focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Order Type Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-3">ORDER TYPE *</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 border border-border rounded cursor-pointer hover:bg-light transition"
                          style={{ background: orderType === 'pickup' ? '#f5f5f5' : 'white', borderColor: orderType === 'pickup' ? '#000' : '#ddd' }}>
                          <input
                            type="radio"
                            name="orderType"
                            value="pickup"
                            checked={orderType === 'pickup'}
                            onChange={(e) => setOrderType(e.target.value)}
                            className="w-4 h-4"
                          />
                          <div>
                            <p className="font-medium text-sm">Pick Up</p>
                            <p className="text-xs text-gray-600">Collect from our store</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 border border-border rounded cursor-pointer hover:bg-light transition"
                          style={{ background: orderType === 'shipping' ? '#f5f5f5' : 'white', borderColor: orderType === 'shipping' ? '#000' : '#ddd' }}>
                          <input
                            type="radio"
                            name="orderType"
                            value="shipping"
                            checked={orderType === 'shipping'}
                            onChange={(e) => setOrderType(e.target.value)}
                            className="w-4 h-4"
                          />
                          <div>
                            <p className="font-medium text-sm">Ship to Address</p>
                            <p className="text-xs text-gray-600">Deliver to my location</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Shipping Address - Only if shipping */}
                    {orderType === 'shipping' && (
                      <div className="space-y-4 pt-4 border-t border-border">
                        <h4 className="font-semibold text-sm">Shipping Address</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">First Name *</label>
                            <input
                              type="text"
                              value={shippingAddress.firstName}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                              placeholder="John"
                              className="w-full px-3 py-2 border border-border rounded text-sm focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name *</label>
                            <input
                              type="text"
                              value={shippingAddress.lastName}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                              placeholder="Doe"
                              className="w-full px-3 py-2 border border-border rounded text-sm focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Company (Optional)</label>
                          <input
                            type="text"
                            value={shippingAddress.company}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, company: e.target.value })}
                            placeholder="Acme Corp"
                            className="w-full px-3 py-2 border border-border rounded text-sm focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Street Address *</label>
                          <input
                            type="text"
                            value={shippingAddress.street}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                            placeholder="123 Industrial Way"
                            className="w-full px-3 py-2 border border-border rounded text-sm focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">City *</label>
                            <input
                              type="text"
                              value={shippingAddress.city}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                              placeholder="Metropolis"
                              className="w-full px-3 py-2 border border-border rounded text-sm focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">State/Province *</label>
                            <input
                              type="text"
                              value={shippingAddress.stateProvince}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, stateProvince: e.target.value })}
                              placeholder="NY"
                              className="w-full px-3 py-2 border border-border rounded text-sm focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">ZIP/Postal Code *</label>
                          <input
                            type="text"
                            value={shippingAddress.zipCode}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                            placeholder="10001"
                            className="w-full px-3 py-2 border border-border rounded text-sm focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-600 bg-light p-3 rounded">
                      EST. PRICE: ₱{totalPrice}
                    </div>
                  </div>
                )}

                {/* Price Display */}
                <div className="p-6 border-b border-border">
                  <div className="text-right">
                    <p className="text-xs text-gray-600">EST. TOTAL PRICE</p>
                    <p className="text-2xl font-bold text-primary">₱{totalPrice}</p>
                    <p className="text-xs text-gray-500 mt-1">{quantity} unit(s) × ₱{selectedProduct?.price}</p>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="p-6 space-y-3">
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="w-full px-4 py-2 border border-border rounded font-medium text-primary hover:bg-light transition"
                    >
                      ← Back
                    </button>
                  )}

                  {step < 4 ? (
                    <button
                      onClick={() => {
                        if (step === 1 && quantity === '') {
                          toast.error('Please enter a quantity between 1-100');
                          return;
                        }
                        setStep(step + 1);
                      }}
                      disabled={!selectedProduct && step === 1}
                      className="w-full px-4 py-3 bg-primary text-white rounded font-medium hover:bg-gray-800 disabled:opacity-50 transition"
                    >
                      Next →
                    </button>
                  ) : step === 4 ? (
                    <button
                      onClick={() => {
                        if (!phoneNumber || phoneNumber.trim() === '') {
                          toast.error('Please enter your phone number');
                          return;
                        }
                        if (orderType === 'shipping') {
                          const { firstName, lastName, street, city, stateProvince, zipCode } = shippingAddress;
                          if (!firstName || !lastName || !street || !city || !stateProvince || !zipCode) {
                            toast.error('Please fill out all required shipping address fields');
                            return;
                          }
                        }
                        setStep(5);
                      }}
                      disabled={!selectedProduct}
                      className="w-full px-4 py-3 bg-primary text-white rounded font-medium hover:bg-gray-800 disabled:opacity-50 transition"
                    >
                      Review Order →
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right Side - Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-border p-8 sticky top-24">
                <h3 className="font-semibold text-primary mb-6">DESIGN PREVIEW</h3>

                {/* Jersey Preview */}
                <div className="flex justify-center items-center min-h-96 bg-light rounded-lg relative">
                  {selectedProduct ? (
                    <div className="w-full max-w-sm">
                      {/* Jersey Container */}
                      <div
                        className="relative w-full aspect-video rounded-lg flex flex-col items-center justify-center shadow-lg"
                        style={{
                          backgroundColor: primaryColor,
                          borderColor: accentColor,
                          borderWidth: '3px',
                        }}
                      >
                        {/* Primary Accent Stripe */}
                        <div
                          className="absolute top-0 left-0 right-0 h-2"
                          style={{ backgroundColor: accentColor }}
                        />

                        {/* Logo Preview */}
                        {logoPreview && (
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="absolute top-4 w-12 h-12 object-contain opacity-80"
                          />
                        )}

                        {/* Main Text */}
                        <div
                          className="text-center"
                          style={{
                            color: accentColor === '#ffffff' ? '#000000' : accentColor,
                            fontSize: '32px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                          }}
                        >
                          <p>{customText || 'TEAM NAME'}</p>
                        </div>

                        {/* Bottom Accent with Additional Colors */}
                        <div className="absolute bottom-0 left-0 right-0 flex h-2">
                          {additionalColor1 || additionalColor2 || additionalColor3 ? (
                            <>
                              {[accentColor, additionalColor1, additionalColor2, additionalColor3]
                                .filter(c => c)
                                .map((color, idx) => (
                                  <div 
                                    key={idx}
                                    className="flex-1" 
                                    style={{ backgroundColor: color }}
                                  ></div>
                                ))
                              }
                            </>
                          ) : (
                            <div className="flex-1" style={{ backgroundColor: accentColor }}></div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                          {selectedProduct?.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {quantity} unit(s) @ ₱{selectedProduct?.price}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-400 text-lg">Select a product to start designing</p>
                    </div>
                  )}
                </div>

                {/* Design Notes */}
                <div className="mt-8 p-4 bg-light rounded text-xs text-gray-600 space-y-2">
                  <p>• Design preview is approximate</p>
                  <p>• Final product may vary based on production requirements</p>
                  <p>• Admin will review and contact you for confirmation</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
