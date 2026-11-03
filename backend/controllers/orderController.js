// backend/controllers/orderController.js
const logger = require('../config/logger');
const Order = require('../models/Order');
const Product = require('../models/Product');

/** Envoie la notification de commande, sans bloquer ni faire échouer la commande. */
const sendOrderNotification = async (orderDetails) => {
  if (!process.env.ORDER_NOTIFICATION_EMAIL) return;

  try {
    const response = await fetch(`${process.env.GATEWAY_URL}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': process.env.INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        to: process.env.ORDER_NOTIFICATION_EMAIL,
        subject: 'Nouvelle Commande Créée',
        text: `Une commande a été créée avec succès pour les produits suivants : \n${orderDetails
          .map((item) => `Produit ID : ${item.productId}, Quantité : ${item.quantity}`)
          .join('\n')}`,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Notification refusée : ${response.status}`);
    }
  } catch (error) {
    logger.error("Erreur lors de l'envoi de la notification", { error: error.message });
  }
};

/** Remet en stock les articles déjà réservés. */
const restoreStock = (items) =>
  Promise.all(
    items.map(({ productId, quantity }) =>
      Product.updateOne({ _id: productId }, { $inc: { stock: quantity } })
    )
  );

/** Crée une commande : prix lus en base et stock réservé de façon atomique. */
exports.createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, shippingMethod } = req.body;
  const reserved = [];

  try {
    const orderDetails = [];

    for (const { productId, quantity } of items) {
      const product = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } }
      );

      if (!product) {
        await restoreStock(reserved);
        const exists = await Product.exists({ _id: productId });
        return res.status(exists ? 409 : 400).json({
          message: exists ? 'Stock insuffisant.' : `Produit introuvable : ${productId}`,
        });
      }

      reserved.push({ productId, quantity });
      orderDetails.push({ productId, quantity, price: product.price });
    }

    const total = orderDetails.reduce((acc, { price, quantity }) => acc + price * quantity, 0);

    const savedOrder = await Order.create({
      userId: req.user.userId,
      items: orderDetails,
      total,
      shippingAddress,
      paymentMethod,
      shippingMethod,
    });

    sendOrderNotification(orderDetails);

    res.status(201).json({ message: 'Commande créée avec succès', order: savedOrder });
  } catch (error) {
    logger.error("Erreur lors de la création de la commande", { error: error.message });
    await restoreStock(reserved).catch(() => {});
    res.status(500).json({ message: 'Une erreur est survenue lors de la création de la commande.' });
  }
};

/** Supprime une commande (administrateurs). */
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande non trouvée.' });
    res.json({ message: 'Commande supprimée.' });
  } catch (error) {
    logger.error("Erreur lors de la suppression de la commande", { error: error.message });
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

/** Liste toutes les commandes (administrateurs). */
exports.getOrders = async (req, res) => {
  try {
    res.json(await Order.find());
  } catch (error) {
    logger.error("Erreur lors de la récupération des commandes", { error: error.message });
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

/** Valide une commande : elle passe en cours de traitement (administrateurs). */
exports.validateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'En cours de traitement' },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Commande non trouvée.' });
    res.json({ message: 'Commande validée avec succès.', order });
  } catch (error) {
    logger.error("Erreur lors de la validation de la commande", { error: error.message });
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

/** Modifie le statut d'une commande (administrateurs). */
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Commande non trouvée.' });
    res.json({ message: 'Statut mis à jour avec succès', order });
  } catch (error) {
    logger.error("Erreur lors de la mise à jour de la commande", { error: error.message });
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
