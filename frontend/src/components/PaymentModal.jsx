import React, { useState } from 'react';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

export default function PaymentModal({
  order,
  isOpen,
  onClose,
  onReceiptSubmitted,
  uploadingReceipt,
}) {
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File must be less than 5MB');
        return;
      }
      setReceiptFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setReceiptPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReceipt = async () => {
    if (!receiptFile) {
      toast.error('Please select a receipt file');
      return;
    }

    setIsSubmitting(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const receiptBase64 = reader.result;
        
        const response = await apiClient.put(`/orders/${order.id}/payment-receipt`, {
          paymentReceipt: receiptBase64,
          fileName: receiptFile.name,
        });

        toast.success('Payment receipt submitted for review! Admin will verify it shortly.');
        setReceiptFile(null);
        setReceiptPreview(null);
        if (onReceiptSubmitted) {
          onReceiptSubmitted();
        }
      };
      reader.readAsDataURL(receiptFile);
    } catch (error) {
      toast.error('Failed to upload receipt: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose}></div>
      
      {/* Side Popup */}
      <div className="relative ml-auto bg-white w-full max-w-2xl max-h-screen overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-gray-800 text-white border-b border-border p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Payment</h2>
            <p className="text-sm text-gray-200">Order #{order.id.substring(0, 12)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Summary Section */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Order Summary</h3>
            <div className="bg-light rounded-lg p-4 space-y-3">
              {order.items && order.items.length > 0 && (
                <>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between pb-3 border-b border-border last:border-b-0">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₱{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="space-y-2 pt-3 border-t-2 border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>₱{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                    </div>
                    {order.setupFee && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Setup Fee:</span>
                        <span>₱{order.setupFee.toFixed(2)}</span>
                      </div>
                    )}
                    {order.shippingFee && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping:</span>
                        <span>₱{order.shippingFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border pt-3">
                      <span className="font-semibold">Total:</span>
                      <span className="text-xl font-bold text-primary">₱{order.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* QR Code Payment Section */}
          {order.qrCode && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">Payment Methods</h3>
              <div className="bg-light rounded-lg p-6 flex justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">{order.qrCodeLabel || 'Scan to Pay'}</p>
                  <img
                    src={order.qrCode}
                    alt="Payment QR Code"
                    className="w-64 h-64 border-2 border-border rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Receipt Upload Section */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Upload Payment Receipt</h3>
            <div className="bg-light rounded-lg p-6 space-y-4">
              {order.paymentReceipt ? (
                <div>
                  <div className="flex items-center justify-between mb-4 p-3 bg-green-50 border border-green-200 rounded">
                    <div>
                      <p className="text-sm font-medium text-green-800">Receipt Submitted</p>
                      <p className="text-xs text-green-700">{order.paymentReceiptFileName || 'Awaiting approval'}</p>
                    </div>
                    <span className="text-2xl">✓</span>
                  </div>
                  {order.paymentReceipt && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Uploaded Receipt:</p>
                      <img
                        src={order.paymentReceipt}
                        alt="Payment Receipt"
                        className="max-w-sm max-h-48 rounded border border-border"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-white">
                    <p className="text-sm text-gray-600 mb-3">Upload a photo or screenshot of your payment receipt/proof</p>
                    <input
                      type="file"
                      onChange={handleReceiptUpload}
                      accept="image/*,.pdf"
                      className="hidden"
                      id="receiptInput"
                    />
                    <label htmlFor="receiptInput" className="cursor-pointer">
                      <div className="text-3xl mb-2">📄</div>
                      <button
                        type="button"
                        onClick={() => document.getElementById('receiptInput').click()}
                        className="px-4 py-2 border border-border rounded text-sm font-medium text-primary hover:bg-light transition"
                      >
                        Choose File
                      </button>
                    </label>
                  </div>

                  {receiptFile && (
                    <>
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-800">✓ File selected: {receiptFile.name}</p>
                      </div>
                      
                      {receiptPreview && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Preview:</p>
                          <img
                            src={receiptPreview}
                            alt="Receipt Preview"
                            className="max-w-sm max-h-48 rounded border border-border"
                          />
                        </div>
                      )}

                      <button
                        onClick={handleSubmitReceipt}
                        disabled={isSubmitting || uploadingReceipt}
                        className="w-full px-4 py-3 bg-primary text-white rounded font-medium hover:bg-gray-800 disabled:opacity-50 transition"
                      >
                        {isSubmitting || uploadingReceipt ? 'Submitting...' : '✓ Submit Receipt'}
                      </button>

                      <button
                        onClick={() => {
                          setReceiptFile(null);
                          setReceiptPreview(null);
                        }}
                        className="w-full px-4 py-2 border border-border rounded font-medium text-gray-700 hover:bg-light transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Instructions:</span> Scan the QR code using your mobile banking app or payment app (GCash, Maya, PayMaya, etc.), complete the payment, then upload a screenshot or photo of the receipt as proof.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-border rounded font-medium text-gray-700 hover:bg-light transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
