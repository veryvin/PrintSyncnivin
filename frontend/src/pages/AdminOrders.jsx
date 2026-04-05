import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';
import { useChatStore } from '../store/chatStore';
import OrderDetailsModal from '../components/OrderDetailsModal';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [expandHistory, setExpandHistory] = useState(false);
  const { openChat } = useChatStore();

  useEffect(() => {
    fetchAllOrders();
    // Refresh orders every 5 seconds to show up-to-date data
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
      console.error(error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await apiClient.put(`/admin/orders/${orderId}`, { status: newStatus });
      toast.success('Order status updated');
      
      // Update local state
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

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-primary mb-2">Manage Orders</h1>
        <p className="text-gray-600 mb-8">Review and manage customer orders with real-time communication</p>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {/* Order List */}
            <div className="space-y-6">
              {/* Pending Orders */}
              {getPendingOrders().length > 0 && (
                <div className="bg-white rounded-lg border border-border overflow-hidden">
                  <div className="bg-yellow-50 border-b border-border p-4">
                    <h2 className="font-semibold text-primary">Pending Review ({getPendingOrders().length})</h2>
                  </div>
                  <div className="divide-y divide-border">
                    {getPendingOrders().map(order => (
                      <div
                        key={order.id}
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="p-4 cursor-pointer hover:bg-light transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-mono text-sm font-semibold">{order.id.substring(0, 12)}</p>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">₱{order.totalPrice} • {order.items?.length || 0} item(s)</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Payment Orders */}
              {getPendingPaymentOrders().length > 0 && (
                <div className="bg-white rounded-lg border border-border overflow-hidden">
                  <div className="bg-orange-50 border-b border-border p-4">
                    <h2 className="font-semibold text-primary">Pending Payment ({getPendingPaymentOrders().length})</h2>
                  </div>
                  <div className="divide-y divide-border">
                    {getPendingPaymentOrders().map(order => (
                      <div
                        key={order.id}
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="p-4 cursor-pointer hover:bg-light transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-mono text-sm font-semibold">{order.id.substring(0, 12)}</p>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                            {order.status?.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">₱{order.totalPrice} • {order.items?.length || 0} item(s)</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Paid Orders */}
              {getPaidOrders().length > 0 && (
                <div className="bg-white rounded-lg border border-border overflow-hidden">
                  <div className="bg-blue-50 border-b border-border p-4">
                    <h2 className="font-semibold text-primary">Paid ({getPaidOrders().length})</h2>
                  </div>
                  <div className="divide-y divide-border">
                    {getPaidOrders().map(order => (
                      <div
                        key={order.id}
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="p-4 cursor-pointer hover:bg-light transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-mono text-sm font-semibold">{order.id.substring(0, 12)}</p>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                            {order.status?.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">₱{order.totalPrice} • {order.items?.length || 0} item(s)</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* In Production Orders */}
              {getInProductionOrders().length > 0 && (
                <div className="bg-white rounded-lg border border-border overflow-hidden">
                  <div className="bg-purple-50 border-b border-border p-4">
                    <h2 className="font-semibold text-primary">In Production ({getInProductionOrders().length})</h2>
                  </div>
                  <div className="divide-y divide-border">
                    {getInProductionOrders().map(order => (
                      <div
                        key={order.id}
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="p-4 cursor-pointer hover:bg-light transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-mono text-sm font-semibold">{order.id.substring(0, 12)}</p>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">₱{order.totalPrice} • {order.items?.length || 0} item(s)</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {orders.length === 0 && (
                <div className="bg-white rounded-lg border border-border p-8 text-center">
                  <p className="text-gray-400">No orders yet</p>
                </div>
              )}

              {/* Order History */}
              {(getCompletedOrders().length > 0 || getRejectedOrders().length > 0) && (
                <div className="mt-8 pt-8 border-t-2 border-border">
                  <button
                    onClick={() => setExpandHistory(!expandHistory)}
                    className="flex items-center justify-between w-full p-4 bg-white rounded-lg border border-border hover:bg-light transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{expandHistory ? '▼' : '▶'}</span>
                      <h2 className="font-semibold text-primary">
                        Order History ({getCompletedOrders().length + getRejectedOrders().length})
                      </h2>
                    </div>
                    <span className="text-sm text-gray-600">
                      {expandHistory ? 'Hide' : 'Show'}
                    </span>
                  </button>

                  {expandHistory && (
                    <div className="space-y-6 mt-6">
                      {/* Completed Orders */}
                      {getCompletedOrders().length > 0 && (
                        <div className="bg-white rounded-lg border border-border overflow-hidden">
                          <div className="bg-green-50 border-b border-border p-4">
                            <h3 className="font-semibold text-primary">Completed ({getCompletedOrders().length})</h3>
                          </div>
                          <div className="divide-y divide-border max-h-96 overflow-y-auto">
                            {getCompletedOrders().map(order => (
                              <div
                                key={order.id}
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowModal(true);
                                }}
                                className="p-3 cursor-pointer hover:bg-light transition"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-mono text-sm font-semibold">{order.id.substring(0, 12)}</p>
                                    <p className="text-sm text-gray-600">{order.customerName}</p>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                    {order.status}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">₱{order.totalPrice}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rejected Orders */}
                      {getRejectedOrders().length > 0 && (
                        <div className="bg-white rounded-lg border border-border overflow-hidden">
                          <div className="bg-red-50 border-b border-border p-4">
                            <h3 className="font-semibold text-primary">Rejected ({getRejectedOrders().length})</h3>
                          </div>
                          <div className="divide-y divide-border max-h-96 overflow-y-auto">
                            {getRejectedOrders().map(order => (
                              <div
                                key={order.id}
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowModal(true);
                                }}
                                className="p-3 cursor-pointer hover:bg-light transition"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-mono text-sm font-semibold">{order.id.substring(0, 12)}</p>
                                    <p className="text-sm text-gray-600">{order.customerName}</p>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                                    {order.status}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">₱{order.totalPrice}</p>
                              </div>
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
        )}
      </div>
    </div>
  );
}
