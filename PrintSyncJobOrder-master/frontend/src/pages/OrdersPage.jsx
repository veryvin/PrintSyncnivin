import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import PaymentModal from '../components/PaymentModal';
import ReceiptModal from '../components/ReceiptModal';
import apiClient from '../utils/apiClient';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const { openChat } = useChatStore();

  useEffect(() => {
    fetchUserOrders();
    const interval = setInterval(fetchUserOrders, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user) return;
    try {
      const response = await apiClient.get('/orders/my-orders');
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

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
      } else if (date && typeof date === 'object' && (date.seconds || date._seconds)) {
        const seconds = date.seconds || date._seconds;
        d = new Date(seconds * 1000);
      } else if (date instanceof Date) {
        d = date;
      } else if (typeof date === 'string') {
        d = new Date(date);
      } else if (typeof date === 'number') {
        d = new Date(date);
      } else if (typeof date === 'object' && date !== null) {
        if (date.seconds !== undefined) d = new Date(date.seconds * 1000);
        else if (date._seconds !== undefined) d = new Date(date._seconds * 1000);
        else return 'N/A';
      } else {
        return 'N/A';
      }
      if (!d || isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'pending-payment': return '💳';
      case 'paid': return '✓';
      case 'in-production': return '⚙';
      case 'completed': return '✓✓';
      case 'rejected': return '✕';
      default: return '•';
    }
  };

  const canViewReceipt = (status) => ['paid', 'in-production', 'completed'].includes(status);

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-primary mb-2">My Orders</h1>
        <p className="text-gray-600 mb-8">Track your custom apparel orders and communicate with our team</p>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Orders List */}
            <div className="lg:col-span-2 space-y-4">
              {orders.map(order => (
                <div
                  key={order.id}
                  onClick={() => {
                    if (order.status === 'pending-payment') {
                      setSelectedOrder(order);
                      setShowPaymentModal(true);
                    } else {
                      setSelectedOrder(order);
                    }
                  }}
                  className={`bg-white rounded-lg border border-border p-6 cursor-pointer transition hover:shadow-md ${
                    selectedOrder?.id === order.id ? 'border-primary border-2' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                        {getStatusIcon(order.status)} Order #{order.id.substring(0, 12)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                      {order.status?.replace('-', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-border text-sm">
                    <div>
                      <p className="text-gray-600">Total Price</p>
                      <p className="font-semibold text-primary">₱{parseFloat(order.totalPrice).toLocaleString('en-PH')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Items</p>
                      <p className="font-semibold">{order.items?.length || 0} item(s)</p>
                    </div>
                  </div>

                  {order.customizationDetails && (
                    <div className="flex gap-4 items-center text-sm">
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: order.customizationDetails.primaryColor }} title="Primary Color" />
                        <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: order.customizationDetails.accentColor }} title="Accent Color" />
                      </div>
                      <span className="text-gray-600">
                        {order.customizationDetails.customText && `Text: ${order.customizationDetails.customText}`}
                      </span>
                      {order.customizationDetails.logoImage && <span title="Logo uploaded">🎨</span>}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    {/* Progress bar */}
                    <div className="flex gap-1 text-xs flex-1 mr-4">
                      {['pending', 'approved', 'in-production', 'completed'].map(status => (
                        <div
                          key={status}
                          className={`flex-1 h-1 rounded ${
                            ['pending', 'approved', 'in-production', 'completed'].indexOf(status) <=
                            ['pending', 'approved', 'in-production', 'completed'].indexOf(order.status)
                              ? 'bg-primary' : 'bg-border'
                          }`}
                        />
                      ))}
                    </div>

                    {/* View Receipt button on the card */}
                    {canViewReceipt(order.status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent card click from firing
                          setSelectedOrder(order);
                          setShowReceiptModal(true);
                        }}
                        className="text-xs text-primary font-medium underline hover:text-gray-600 transition whitespace-nowrap"
                      >
                        🧾 View Receipt
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar */}
            {selectedOrder ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-border p-6 sticky top-24">
                  <div className="mb-4">
                    <p className="text-xs text-gray-600">ORDER STATUS</p>
                    <p className={`text-2xl font-bold capitalize ${statusColors[selectedOrder.status]?.split(' ')[0]}`}>
                      {selectedOrder.status?.replace('-', ' ')}
                    </p>
                  </div>

                  <div className="mb-4 pb-4 border-b border-border">
                    <p className="text-xs text-gray-600 mb-2">ORDER ID</p>
                    <p className="font-mono text-sm font-semibold break-all">{selectedOrder.id}</p>
                  </div>

                  {selectedOrder.customizationDetails && (
                    <div className="mb-4 pb-4 border-b border-border">
                      <p className="text-xs text-gray-600 mb-3">CUSTOMIZATION</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: selectedOrder.customizationDetails.primaryColor }} />
                          <span>Primary: {selectedOrder.customizationDetails.primaryColor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: selectedOrder.customizationDetails.accentColor }} />
                          <span>Accent: {selectedOrder.customizationDetails.accentColor}</span>
                        </div>
                        {selectedOrder.customizationDetails.customText && (
                          <div><span className="text-gray-600">Text:</span> {selectedOrder.customizationDetails.customText}</div>
                        )}
                        {selectedOrder.customizationDetails.logoImage && (
                          <div><span className="text-gray-600">Logo:</span> Included ✓</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <p className="text-xs text-gray-600">TOTAL</p>
                    <p className="text-3xl font-bold text-primary">₱{parseFloat(selectedOrder.totalPrice).toLocaleString('en-PH')}</p>
                  </div>

                  {/* View Receipt button in sidebar */}
                  {canViewReceipt(selectedOrder.status) && (
                    <button
                      onClick={() => setShowReceiptModal(true)}
                      className="w-full mb-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium transition"
                    >
                      🧾 View Receipt
                    </button>
                  )}

                  <button
                    onClick={() => openChat(selectedOrder.id, selectedOrder.status)}
                    className="w-full bg-secondary hover:bg-orange-400 text-white py-2 rounded font-medium transition"
                  >
                    Open Chat with Admin
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-border p-8 text-center sticky top-24">
                <p className="text-gray-400">Select an order to view details and chat</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-border p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">You haven't placed any orders yet</p>
            <a href="/store" className="inline-block px-6 py-2 bg-primary text-white rounded font-medium hover:bg-gray-800 transition">
              Start shopping →
            </a>
          </div>
        )}

        {/* Payment Modal */}
        <PaymentModal
          order={selectedOrder}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onReceiptSubmitted={() => {
            setShowPaymentModal(false);
            fetchUserOrders();
          }}
          uploadingReceipt={uploadingReceipt}
        />

        {/* Receipt Modal */}
        <ReceiptModal
          order={selectedOrder}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      </div>
    </div>
  );
}