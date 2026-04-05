import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

export const sendMessage = async (req, res) => {
  try {
    const { orderId, message, senderRole, senderName } = req.body;
    const senderId = req.user.uid;

    if (!orderId || !message) {
      return res.status(400).json({ error: 'Order ID and message are required' });
    }

    if (!['admin', 'customer'].includes(senderRole)) {
      return res.status(400).json({ error: 'Invalid sender role' });
    }

    // Save message to messages collection
    const messageRef = await db.collection('messages').add({
      orderId,
      senderId,
      senderName,
      senderRole,
      message,
      timestamp: Timestamp.now(),
      read: false,
    });

    // Update order's last message timestamp
    await db.collection('orders').doc(orderId).update({
      lastMessageAt: Timestamp.now(),
      unreadMessages: senderRole === 'admin' ? true : false,
    });

    res.status(201).json({
      id: messageRef.id,
      orderId,
      senderId,
      senderName,
      senderRole,
      message,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderMessages = async (req, res) => {
  try {
    const { orderId } = req.params;

    let snapshot;
    try {
      snapshot = await db
        .collection('messages')
        .where('orderId', '==', orderId)
        .orderBy('timestamp', 'asc')
        .get();
    } catch (indexError) {
      // Fallback if composite index not created: fetch all and sort in memory
      const allMessages = await db
        .collection('messages')
        .where('orderId', '==', orderId)
        .get();
      const messages = [];
      allMessages.forEach(doc => {
        messages.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate(),
        });
      });
      // Sort by timestamp
      messages.sort((a, b) => a.timestamp - b.timestamp);
      
      // Mark messages as read
      for (const doc of allMessages.docs) {
        if (doc.data().senderId !== req.user.uid) {
          await doc.ref.update({ read: true });
        }
      }
      
      return res.json(messages);
    }

    const messages = [];
    snapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      });
    });

    // Mark messages as read if current user is the recipient
    for (const doc of snapshot.docs) {
      if (doc.data().senderId !== req.user.uid) {
        await doc.ref.update({ read: true });
      }
    }

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderConversation = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order details
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get all messages for this order
    let messagesSnapshot;
    try {
      messagesSnapshot = await db
        .collection('messages')
        .where('orderId', '==', orderId)
        .orderBy('timestamp', 'asc')
        .get();
    } catch (indexError) {
      // Fallback if composite index not created: fetch without orderBy
      messagesSnapshot = await db
        .collection('messages')
        .where('orderId', '==', orderId)
        .get();
    }

    const messages = [];
    messagesSnapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      });
    });

    // Sort by timestamp if not already sorted by Firestore
    messages.sort((a, b) => a.timestamp - b.timestamp);

    res.json({
      order: { id: orderDoc.id, ...orderDoc.data() },
      messages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
