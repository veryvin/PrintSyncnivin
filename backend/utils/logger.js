import { db } from '../config/firebase.js';

export const logActivity = async (userId, action, details = {}) => {
  try {
    await db.collection('logs').add({
      userId,
      action,
      details,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

export const getActivityLogs = async (limit = 50) => {
  try {
    const snapshot = await db
      .collection('logs')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    const logs = [];
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    
    return logs;
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
};
