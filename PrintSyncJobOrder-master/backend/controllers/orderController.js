import { db } from '../config/firebase.js';

export const createOrder = async (req, res) => {
  try {
    const { userId, customerName, customerEmail, phoneNumber, orderType, shippingAddress, items, customizationDetails, totalPrice } = req.body;
    const docRef = await db.collection('orders').add({
      userId,
      customerName,
      customerEmail,
      phoneNumber: phoneNumber || '',
      orderType: orderType || 'pickup',
      shippingAddress: shippingAddress || null,
      items,
      customizationDetails,
      totalPrice: parseFloat(totalPrice),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.status(201).json({ id: docRef.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    let snapshot;
    try {
      snapshot = await db
        .collection('orders')
        .orderBy('createdAt', 'desc')
        .limit(20) // 👈 ADD THIS
        .get(); 
       } catch (indexError) {
      // Fallback if composite index not created: fetch without orderBy
      const allOrders = await db
        .where('userId', '==', req.user.uid)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();
      const orders = [];
      allOrders.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      // Sort by createdAt in memory
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(orders);
    }
    
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    let snapshot;
    try {
      snapshot = await db
        .collection('orders')
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();
    } catch (indexError) {
      // Fallback if composite index not created: fetch without orderBy
      snapshot = await db
        .collection('orders')
        .get();
    }
    
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by createdAt in memory if not already sorted
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.collection('orders').doc(id).update({
      status,
      updatedAt: new Date(),
    });
    res.json({ message: 'Order updated', id, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const allOrders = await db.collection('orders').get();
    const orders = [];
    allOrders.forEach(doc => {
      orders.push(doc.data());
    });

    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { qrCode, qrCodeLabel } = req.body;

    if (!qrCode || !qrCodeLabel) {
      return res.status(400).json({ error: 'QR code and label are required' });
    }

    await db.collection('orders').doc(id).update({
      qrCode,
      qrCodeLabel,
      updatedAt: new Date(),
    });

    res.json({ message: 'QR code uploaded', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadPaymentReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentReceipt } = req.body;

    if (!paymentReceipt) {
      return res.status(400).json({ error: 'Payment receipt is required' });
    }

    await db.collection('orders').doc(id).update({
      paymentReceipt,
      paymentReceiptDate: new Date(),
      updatedAt: new Date(),
    });

    res.json({ message: 'Payment receipt uploaded', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const approvePayment = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection('orders').doc(id).update({
      status: 'paid',
      updatedAt: new Date(),
    });

    res.json({ message: 'Payment approved', id, status: 'paid' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection('orders').doc(id).update({
      status: 'pending-payment',
      paymentReceipt: null,
      paymentReceiptDate: null,
      updatedAt: new Date(),
    });

    res.json({ message: 'Payment rejected', id, status: 'pending-payment' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
