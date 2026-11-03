// backend/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');

/** Envoie la notification de commande, sans bloquer ni faire échouer la commande. */
const sendOrderNotification = async (orderDetails) => {
  try {
    const response = await fetch(`${process.env.GATEWAY_URL}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': process.env.INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        to: 'syaob@yahoo.fr',
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
    console.error(`Erreur lors de l'envoi de la notification : ${error.message}`);
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
    console.error(`Erreur lors de la création de la commande : ${error.message}`);
    await restoreStock(reserved).catch(() => {});
    res.status(500).json({ message: 'Une erreur est survenue lors de la création de la commande.' });
  }
};

exports.deleteOrder = async(req, res)=>{
    const { orderId } = req.body;
    console.log(`orderId to delete is ${orderId}`)
}

/** Liste toutes les commandes (administrateurs). */
exports.getOrders = async (req, res) => {
  try {
    res.json(await Order.find());
  } catch (error) {
    console.error(`Erreur lors de la récupération des commandes : ${error.message}`);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.validateOrder = async (req, res) => {
  const { orderId } = req.body;
  res.status(200).json({message: `Commande ${orderId} validée avec succès.`})
}

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
    console.error(`Erreur lors de la mise à jour de la commande : ${error.message}`);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
