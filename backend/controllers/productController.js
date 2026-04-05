import { db, auth } from '../config/firebase.js';

export const getAllProducts = async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const products = [];
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const doc = await db.collection('products').doc(req.params.id).get();
    if (doc.exists) {
      res.json({ id: doc.id, ...doc.data() });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, category, price, description, image } = req.body;

    const docRef = await db.collection('products').add({
      name,
      category,
      price: parseFloat(price),
      description,
      imageBase64: image || null, // Store image as base64
      createdAt: new Date(),
    });
    res.status(201).json({ 
      id: docRef.id, 
      name, 
      category, 
      price, 
      description, 
      imageBase64: image || null 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, image } = req.body;
    
    let updateData = {
      name,
      category,
      price: parseFloat(price),
      description,
      updatedAt: new Date(),
    };

    // Only update image if provided
    if (image) {
      updateData.imageBase64 = image;
    }

    await db.collection('products').doc(id).update(updateData);
    res.json({ id, ...updateData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('products').doc(id).delete();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
