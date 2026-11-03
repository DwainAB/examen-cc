// controllers/productController.js
const logger = require('../config/logger');
const audit = require('../config/audit');
const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    res.json(await Product.find());
  } catch (error) {
    logger.error("Erreur lors de la récupération des produits", { error: error.message });
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.updateProductStock = async (req, res) => {
    try {
      const { stock } = req.body;
      const {productId} = req.params;
  
      if (stock < 0) {
        return res.status(400).json({ message: "Le stock ne peut pas être négatif." });
      }
  
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé." });
      }
  
      product.stock = stock;
      product.updatedAt = Date.now();
  
      await product.save();
  
      audit('stock_modifie', { adminId: req.user.userId, productId, stock });
  
      res.json({ message: "Stock mis à jour avec succès.", product });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du stock', { error: error.message });
      res.status(500).json({ message: "Erreur serveur." });
    }
  };