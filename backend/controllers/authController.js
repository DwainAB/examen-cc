// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // modèle utilisateur
require('dotenv').config();

exports.login = async (req, res) => {
  const { username, password } = req.body;


  try {
    const user = await User.findOne({ username });
    if (!user) {
      audit('connexion_echouee', { username, ip: req.ip });
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      audit('connexion_echouee', { username, ip: req.ip });
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });

    audit('connexion_reussie', { userId: user._id.toString(), role: user.role, ip: req.ip });
    res.json({ role: user.role, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: "Ce nom d'utilisateur ou cet email est déjà utilisé." });
    }

    const user = await User.create({ username, email, password });
    audit('inscription', { userId: user._id.toString() });

    res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Ce nom d'utilisateur ou cet email est déjà utilisé." });
    }
    logger.error("Erreur lors de l'inscription", { error: error.message });
    res.status(500).json({ message: 'Une erreur est survenue.' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Déconnexion réussie' });
};
