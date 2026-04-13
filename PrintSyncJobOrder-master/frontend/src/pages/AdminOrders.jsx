import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';
import { useChatStore } from '../store/chatStore';
import OrderDetailsModal from '../components/OrderDetailsModal';
import toast from 'react-hot-toast';

const FilterIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M10 12h4" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);

const UploadIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [expandHistory, setExpandHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const { openChat } = useChatStore();

  useEffect(() => {
    fetchAllOrders();
    const interval = setInterval(fetchAllOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllOrders = async () => {
    try {
      const response = await apiClient.get('/admin/orders');
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await apiClient.put(`/admin/orders/${orderId}`, { status: newStatus });
      toast.success('Order status updated');
      const updatedOrders = orders.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      );
      setOrders(updatedOrders);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update order');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleApprove = (orderId) => handleStatusUpdate(orderId, 'pending-payment');
  const handleReject = (orderId) => handleStatusUpdate(orderId, 'rejected');
  const handleApprovePayment = (orderId) => handleStatusUpdate(orderId, 'paid');
  const handleStartProduction = (orderId) => handleStatusUpdate(orderId, 'in-production');
  const handleComplete = (orderId) => handleStatusUpdate(orderId, 'completed');

  const getPendingOrders = () => orders.filter(o => o.status === 'pending');
  const getPendingPaymentOrders = () => orders.filter(o => o.status === 'pending-payment');
  const getPaidOrders = () => orders.filter(o => o.status === 'paid');
  const getInProductionOrders = () => orders.filter(o => o.status === 'in-production');
  const getCompletedOrders = () => orders.filter(o => o.status === 'completed');
  const getRejectedOrders = () => orders.filter(o => o.status === 'rejected');

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'pending-payment': 'bg-orange-100 text-orange-800',
    paid: 'bg-blue-100 text-blue-800',
    'in-production': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const statuses = ['all', 'pending', 'pending-payment', 'paid', 'in-production', 'completed', 'rejected'];

  const activeOrders = orders.filter(o =>
    !['completed', 'rejected'].includes(o.status)
  );

  const filteredActive = activeOrders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const OrderRow = ({ order }) => (
    <div
      className="bg-white border border-gray-200 p-5 cursor-pointer hover:shadow-sm transition"
      onClick={() => { setSelectedOrder(order); setShowModal(true); }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
            🧾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[0.6rem] font-bold uppercase px-2 py-0.5 rounded ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                {order.status?.replace(/-/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              <span className="font-mono font-bold text-[#111]">{order.id.substring(0, 12)}</span>
              &nbsp;•&nbsp;{order.customerName}&nbsp;•&nbsp;{order.items?.length || 0} Item{order.items?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[0.6rem] text-gray-400 uppercase tracking-wide">Total</p>
            <p className="text-sm font-black text-[#111]">₱{parseFloat(order.totalPrice).toLocaleString('en-PH')}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); toast.success('Downloading...'); }}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition"
            title="Download"
          >
            <DownloadIcon />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setShowModal(true); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#111] text-white text-xs font-bold uppercase tracking-wide hover:bg-gray-800 transition"
          >
            Details →
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[#111]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-[#111] uppercase">Order Management</h1>
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Review and manage customer orders with real-time communication</p>
          </div>
        </div>

        {/* Direct Artwork Upload Box */}
        <div className="bg-white border border-gray-200 p-10 text-center mb-6">
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <UploadIcon />
            <p className="text-sm font-semibold text-[#111] mt-1">Direct Artwork Upload</p>
            <p className="text-xs text-gray-400">Drag and drop your print-ready files here (AI, EPS, PDF, high-res PNG). Our team will review and send a quote.</p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 mb-4 relative">
          <input
            type="text"
            placeholder="Search orders by ID or project name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-xs text-[#111] focus:outline-none focus:border-[#111] bg-white"
          />
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-xs font-bold uppercase tracking-wide text-[#111] hover:bg-gray-50 transition"
            >
              <FilterIcon />
              Filter Status
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 z-10 w-44 shadow-md">
                {statuses.map(s => (
                  <button
                    key={s}
                    onClick={() => { setFilterStatus(s); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-xs uppercase tracking-wide hover:bg-gray-50 transition ${filterStatus === s ? 'font-bold text-[#111]' : 'text-gray-500'}`}
                  >
                    {s === 'all' ? 'All Statuses' : s.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Orders */}
        {filteredActive.length > 0 ? (
          <div className="space-y-3 mb-6">
            {filteredActive.map(order => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 p-12 text-center mb-6">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-sm text-gray-400">No active orders found</p>
          </div>
        )}

        {/* Order History */}
        {(getCompletedOrders().length > 0 || getRejectedOrders().length > 0) && (
          <div className="border border-gray-200 bg-white">
            <button
              onClick={() => setExpandHistory(!expandHistory)}
              className="flex items-center justify-between w-full px-5 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm">{expandHistory ? '▼' : '▶'}</span>
                <h2 className="text-sm font-black uppercase tracking-widest text-[#111]">
                  Order History ({getCompletedOrders().length + getRejectedOrders().length})
                </h2>
              </div>
              <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
                {expandHistory ? 'Hide' : 'Show'}
              </span>
            </button>

            {expandHistory && (
              <div className="border-t border-gray-200">
                {/* Completed */}
                {getCompletedOrders().length > 0 && (
                  <div className="mb-1">
                    <div className="px-5 py-2 bg-green-50 border-b border-gray-100">
                      <p className="text-xs font-bold uppercase tracking-wide text-green-700">Completed ({getCompletedOrders().length})</p>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                      {getCompletedOrders().map(order => (
                        <OrderRow key={order.id} order={order} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejected */}
                {getRejectedOrders().length > 0 && (
                  <div>
                    <div className="px-5 py-2 bg-red-50 border-b border-gray-100">
                      <p className="text-xs font-bold uppercase tracking-wide text-red-700">Rejected ({getRejectedOrders().length})</p>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                      {getRejectedOrders().map(order => (
                        <OrderRow key={order.id} order={order} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        onApprovePayment={handleApprovePayment}
        onStartProduction={handleStartProduction}
        onComplete={handleComplete}
        onOpenChat={openChat}
        updatingStatus={updatingStatus}
      />
    </div>
  );
}