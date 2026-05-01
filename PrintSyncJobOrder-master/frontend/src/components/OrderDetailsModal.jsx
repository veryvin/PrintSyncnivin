import React, { useState } from 'react';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onApprovePayment,
  onStartProduction,
  onComplete,
  onOpenChat,
  updatingStatus,
}) {
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState(null);
  const [qrCodeLabel, setQrCodeLabel] = useState('');
  const [uploadingQR, setUploadingQR] = useState(false);
  const [approvePaymentLoading, setApprovePaymentLoading] = useState(false);

  if (!isOpen || !order) return null;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'pending-payment': 'bg-orange-100 text-orange-800',
    paid: 'bg-blue-100 text-blue-800',
    'in-production': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      let d;
      
      if (date && typeof date.toDate === 'function') {
        d = date.toDate();
      } 
      else if (date && typeof date === 'object' && (date.seconds || date._seconds)) {
        const seconds = date.seconds || date._seconds;
        d = new Date(seconds * 1000);
      }
      else if (date instanceof Date) {
        d = date;
      }
      else if (typeof date === 'string') {
        d = new Date(date);
      }
      else if (typeof date === 'number') {
        d = new Date(date);
      }
      else if (typeof date === 'object' && date !== null) {
        if (date.seconds !== undefined) {
          d = new Date(date.seconds * 1000);
        } else if (date._seconds !== undefined) {
          d = new Date(date._seconds * 1000);
        } else {
          return 'N/A';
        }
      }
      else {
        return 'N/A';
      }
      
      if (!d || isNaN(d.getTime())) {
        return 'N/A';
      }
      
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const handleQRCodeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File must be less than 5MB');
        return;
      }
      setQrCodeFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setQrCodePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadQRCode = async () => {
    if (!qrCodeFile) {
      toast.error('Please select a QR code image');
      return;
    }

    if (!qrCodeLabel.trim()) {
      toast.error('Please enter a label for the QR code (e.g., GCash, Maya)');
      return;
    }

    setUploadingQR(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const qrBase64 = reader.result;
        
        await apiClient.put(`/admin/orders/${order.id}/upload-qr`, {
          qrCode: qrBase64,
          qrCodeLabel: qrCodeLabel,
        });

        toast.success('QR Code uploaded successfully!');
        setQrCodeFile(null);
        setQrCodePreview(null);
        setQrCodeLabel('');
      };
      reader.readAsDataURL(qrCodeFile);
    } catch (error) {
      toast.error('Failed to upload QR code: ' + error.message);
    } finally {
      setUploadingQR(false);
    }
  };

  const handleApprovePayment = async () => {
    if (!order.paymentReceipt) {
      toast.error('No payment receipt uploaded by customer');
      return;
    }

    setApprovePaymentLoading(true);
    try {
      await apiClient.put(`/admin/orders/${order.id}/approve-payment`, {});
      toast.success('Payment approved! Order moved to production.');
      onApprovePayment(order.id);
    } catch (error) {
      toast.error('Failed to approve payment: ' + error.message);
    } finally {
      setApprovePaymentLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    setApprovePaymentLoading(true);
    try {
      await apiClient.put(`/admin/orders/${order.id}/reject-payment`, {});
      toast.success('Payment rejected. Customer will need to resubmit.');
      onReject(order.id);
    } catch (error) {
      toast.error('Failed to reject payment: ' + error.message);
    } finally {
      setApprovePaymentLoading(false);
    }
  };

  // Derive lineup from customizationDetails
  const lineup = order.customizationDetails?.lineup || [];
  const oversizedSizes = ['XXL', '3XL', '4XL', '5XL'];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose}></div>
      
      {/* Side Popup */}
      <div className="relative ml-auto bg-white w-full max-w-2xl max-h-screen overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-gray-800 text-white border-b border-border p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Order Details</h2>
            <p className="text-sm text-gray-200 font-mono">{order.id}</p>
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
          {/* Status Badge */}
          <div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
              {order.status?.replace('-', ' ').toUpperCase()}
            </span>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3">Customer Information</h3>
            <div className="bg-light rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-600">CUSTOMER NAME</p>
                <p className="font-medium">{order.customerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">EMAIL</p>
                <p className="font-medium">{order.customerEmail || 'N/A'}</p>
              </div>
              {order.phoneNumber && (
                <div>
                  <p className="text-xs text-gray-600">PHONE NUMBER</p>
                  <p className="font-medium">{order.phoneNumber}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-600">ORDER DATE</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          {order.orderType && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Delivery Information</h3>
              <div className="bg-light rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-600">ORDER TYPE</p>
                  <p className="font-medium capitalize">{order.orderType === 'pickup' ? 'Pick Up' : 'Shipping'}</p>
                </div>
                {order.orderType === 'shipping' && order.shippingAddress && (
                  <>
                    <div className="border-t border-border pt-3">
                      <p className="text-xs text-gray-600 mb-2">SHIPPING ADDRESS</p>
                      <p className="font-medium">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      {order.shippingAddress.company && (
                        <p className="text-sm text-gray-600">{order.shippingAddress.company}</p>
                      )}
                      <p className="text-sm text-gray-600">{order.shippingAddress.street}</p>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress.city}, {order.shippingAddress.stateProvince} {order.shippingAddress.zipCode}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Items Ordered */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-3">Items Ordered</h3>
            <div className="bg-light rounded-lg p-4 space-y-3">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                    <p className="font-medium">{item.productName}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                      <div>Quantity: {item.quantity}</div>
                      <div>Price: ₱{item.price}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No items</p>
              )}
            </div>
          </div>

          {/* Customization Details */}
          {order.customizationDetails && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Customization Details</h3>
              <div className="bg-light rounded-lg p-4 space-y-3">
                {/* Primary Color */}
                {order.customizationDetails.primaryColor && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Primary Color:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border-2 border-border shadow-sm"
                        style={{ backgroundColor: order.customizationDetails.primaryColor }}
                      ></div>
                      <span className="text-sm font-mono">{order.customizationDetails.primaryColor}</span>
                    </div>
                  </div>
                )}

                {/* Accent Color */}
                {order.customizationDetails.accentColor && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Accent Color:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border-2 border-border shadow-sm"
                        style={{ backgroundColor: order.customizationDetails.accentColor }}
                      ></div>
                      <span className="text-sm font-mono">{order.customizationDetails.accentColor}</span>
                    </div>
                  </div>
                )}

                {/* Additional Colors */}
                {order.customizationDetails.additionalColors && (
                  <div>
                    <p className="text-gray-600 mb-2">Additional Colors:</p>
                    <div className="flex gap-2 ml-4">
                      {Object.values(order.customizationDetails.additionalColors).map((color, idx) => (
                        color && (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded border-2 border-border shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                          ></div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Text */}
                {order.customizationDetails.customText && (
                  <div className="border-t border-border pt-3">
                    <p className="text-gray-600">Custom Text:</p>
                    <p className="font-medium mt-1 italic">{order.customizationDetails.customText}</p>
                  </div>
                )}

                {/* Jersey Layout Comments */}
                {order.customizationDetails.jerseyLayoutComments && (
                  <div className="border-t border-border pt-3">
                    <p className="text-gray-600">Layout Notes:</p>
                    <p className="font-medium mt-1 bg-white p-2 rounded border border-border">
                      {order.customizationDetails.jerseyLayoutComments}
                    </p>
                  </div>
                )}

                {/* Logo */}
                {order.customizationDetails.logoImage && (
                  <div className="border-t border-border pt-3">
                    <p className="text-gray-600 mb-2">Logo Image:</p>
                    <img
                      src={order.customizationDetails.logoImage}
                      alt="Logo"
                      className="max-w-xs max-h-48 rounded border border-border"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TEAM LINEUP ── */}
          {lineup.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">
                Team Lineup
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({lineup.length} player{lineup.length !== 1 ? 's' : ''})
                </span>
              </h3>
              <div className="rounded-lg overflow-hidden border border-border">
                {/* Table Header */}
                <div
                  className="grid bg-gray-800 text-white px-4 py-2.5"
                  style={{ gridTemplateColumns: '36px 1fr 64px 64px' }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest">#</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Surname</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-center">No.</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-center">Size</p>
                </div>

                {/* Table Rows */}
                <div
                  className="max-h-64 overflow-y-auto"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {lineup.map((player, idx) => {
                    const isOversized = oversizedSizes.includes(
                      (player.size || '').toUpperCase()
                    );
                    return (
                      <div
                        key={idx}
                        className={`grid px-4 py-2.5 border-b border-border last:border-b-0 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                        style={{ gridTemplateColumns: '36px 1fr 64px 64px' }}
                      >
                        <span className="text-xs font-black text-gray-400 self-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-gray-800 uppercase self-center">
                          {player.surname || '—'}
                        </span>
                        <span className="text-sm font-black text-gray-800 text-center self-center">
                          {player.jerseyNumber || '—'}
                        </span>
                        <span className="text-center self-center">
                          {isOversized ? (
                            <span className="inline-block px-2 py-0.5 bg-pink-500 text-white text-[10px] font-bold rounded-full">
                              {player.size}
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-gray-600">
                              {player.size || '—'}
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Footer summary */}
                <div className="bg-gray-50 border-t border-border px-4 py-2 flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {lineup.length} player{lineup.length !== 1 ? 's' : ''} total
                  </span>
                  {lineup.some(p => oversizedSizes.includes((p.size || '').toUpperCase())) && (
                    <span className="flex items-center gap-1 text-[10px] text-pink-600 font-medium">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                      Oversized sizes present
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No lineup provided notice */}
          {lineup.length === 0 && order.customizationDetails && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Team Lineup</h3>
              <div className="bg-light rounded-lg p-4 text-center">
                <p className="text-sm text-gray-400 italic">No lineup provided by customer.</p>
                <p className="text-xs text-gray-400 mt-1">Contact the customer to confirm player details.</p>
              </div>
            </div>
          )}

          {/* Order Total */}
          <div className="border-t border-b border-border py-3">
            <p className="text-gray-600">Order Total</p>
            <p className="text-3xl font-bold text-primary">₱{order.totalPrice}</p>
          </div>

          {/* Payment Management Section */}
          {order.status === 'pending-payment' && (
            <div className="border-t border-b border-orange-300 bg-orange-50 p-4 space-y-4">
              {/* QR Code Upload Section */}
              {!order.qrCode && (
                <div className="bg-white p-3 rounded border border-orange-200">
                  <h4 className="font-semibold text-gray-800 mb-2">📱 Upload QR Code for Payment</h4>
                  <p className="text-xs text-gray-600 mb-3">Upload a QR code image so customer can scan and pay</p>
                  
                  {qrCodePreview && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-2">Preview:</p>
                      <img src={qrCodePreview} alt="QR Code Preview" className="max-w-xs max-h-32 rounded border border-border" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={qrCodeLabel}
                      onChange={(e) => setQrCodeLabel(e.target.value)}
                      placeholder="e.g., GCash Payment, Maya, Bank Transfer"
                      className="w-full px-3 py-2 border border-border rounded text-sm"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQRCodeUpload}
                      className="w-full text-sm"
                    />
                    <button
                      onClick={handleUploadQRCode}
                      disabled={!qrCodeFile || !qrCodeLabel || uploadingQR}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 rounded font-medium text-sm transition"
                    >
                      {uploadingQR ? 'Uploading...' : 'Upload QR Code'}
                    </button>
                  </div>
                </div>
              )}

              {/* QR Code Uploaded Indicator */}
              {order.qrCode && (
                <div className="bg-green-50 p-3 rounded border border-green-300">
                  <p className="text-sm text-green-800 font-medium">✓ QR Code uploaded</p>
                  <p className="text-xs text-gray-600 mt-1">{order.qrCodeLabel || 'Payment Method'}</p>
                </div>
              )}

              {/* Payment Receipt Review Section */}
              {order.paymentReceipt && (
                <div className="bg-white p-3 rounded border border-orange-200">
                  <h4 className="font-semibold text-gray-800 mb-2">💳 Customer Payment Receipt</h4>
                  <img 
                    src={order.paymentReceipt} 
                    alt="Payment Receipt" 
                    className="max-w-xs max-h-40 rounded border border-border mb-3"
                  />
                  <p className="text-xs text-gray-600 mb-3">Uploaded: {formatDate(order.paymentReceiptDate)}</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleApprovePayment}
                      disabled={approvePaymentLoading}
                      className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2 rounded font-medium text-sm transition"
                    >
                      {approvePaymentLoading ? '...' : '✓ Approve'}
                    </button>
                    <button
                      onClick={handleRejectPayment}
                      disabled={approvePaymentLoading}
                      className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2 rounded font-medium text-sm transition"
                    >
                      {approvePaymentLoading ? '...' : '✕ Reject'}
                    </button>
                  </div>
                </div>
              )}

              {/* Waiting for Payment Receipt */}
              {!order.paymentReceipt && (
                <div className="bg-yellow-50 p-3 rounded border border-yellow-300">
                  <p className="text-sm text-yellow-800 font-medium">⏳ Waiting for customer to upload payment receipt</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {order.status === 'pending' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onApprove(order.id)}
                  disabled={updatingStatus}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2 rounded font-medium transition"
                >
                  ✓ Accept
                </button>
                <button
                  onClick={() => onReject(order.id)}
                  disabled={updatingStatus}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2 rounded font-medium transition"
                >
                  ✕ Reject
                </button>
              </div>
            )}

            {order.status === 'pending-payment' && (
              <div>
                {order.paymentReceipt && order.status === 'pending-payment' && (
                  <div className="p-2 bg-blue-50 rounded text-xs text-blue-800 mb-2 text-center">
                    Review payment receipt above
                  </div>
                )}
                {!order.paymentReceipt && (
                  <button
                    disabled={true}
                    className="w-full bg-gray-300 text-gray-600 py-2 rounded font-medium transition cursor-not-allowed"
                  >
                    ⏳ Waiting for Payment Receipt
                  </button>
                )}
              </div>
            )}

            {order.status === 'paid' && (
              <button
                onClick={() => onStartProduction(order.id)}
                disabled={updatingStatus}
                className="w-full bg-primary hover:bg-gray-800 disabled:opacity-50 text-white py-2 rounded font-medium transition"
              >
                → Start Production
              </button>
            )}

            {order.status === 'in-production' && (
              <button
                onClick={() => onComplete(order.id)}
                disabled={updatingStatus}
                className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2 rounded font-medium transition"
              >
                ✓ Mark Complete
              </button>
            )}

            <button
              onClick={() => onOpenChat(order.id, order.status)}
              className="w-full bg-secondary hover:bg-orange-400 text-white py-2 rounded font-medium transition"
            >
              Open Chat
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}