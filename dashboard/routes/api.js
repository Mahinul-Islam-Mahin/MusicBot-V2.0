const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middleware/auth');
const {
  addPremiumUser,
  removePremiumUser,
  isPremiumUser,
} = require('../../premiumFeatures');

// Get bot status
router.get('/status', checkAuth, (req, res) => {
  try {
    // Implement bot status check logic here
    res.json({
      status: 'online',
      activity: 'Playing Music',
      servers: req.user.guilds.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bot status' });
  }
});

// Update bot status
router.post('/status', checkAuth, (req, res) => {
  try {
    const { status, activity } = req.body;
    // Implement bot status update logic here
    res.json({ message: 'Bot status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bot status' });
  }
});

// Update server prefix
router.post('/prefix/:serverId', checkAuth, (req, res) => {
  try {
    const { serverId } = req.params;
    const { prefix } = req.body;

    // Validate if user has permission to update prefix
    const server = req.user.guilds.find(g => g.id === serverId);
    if (!server || !(server.permissions & 0x20)) {
      return res.status(403).json({ error: 'No permission to update prefix' });
    }

    // Implement prefix update logic here
    res.json({ message: 'Server prefix updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update server prefix' });
  }
});

// Get server settings
router.get('/settings/:serverId', checkAuth, (req, res) => {
  try {
    const { serverId } = req.params;

    // Validate if user has access to server settings
    const server = req.user.guilds.find(g => g.id === serverId);
    if (!server || !(server.permissions & 0x20)) {
      return res.status(403).json({ error: 'No permission to view settings' });
    }

    // Get premium status
    const premium = isPremiumUser(req.user.id);

    res.json({
      prefix: '=',
      premium,
      features: premium
        ? ['enhanced_audio', 'custom_playlist', 'extended_queue']
        : [],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch server settings' });
  }
});

// Toggle premium status
router.post('/premium/toggle', checkAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const isPremium = isPremiumUser(userId);

    if (isPremium) {
      removePremiumUser(userId);
      res.json({ premium: false, message: 'Premium status disabled' });
    } else {
      addPremiumUser(userId);
      res.json({ premium: true, message: 'Premium status enabled' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle premium status' });
  }
});

// Update server settings
router.post('/settings/:serverId', checkAuth, (req, res) => {
  try {
    const { serverId } = req.params;
    const { settings } = req.body;

    // Validate if user has permission to update settings
    const server = req.user.guilds.find(g => g.id === serverId);
    if (!server || !(server.permissions & 0x20)) {
      return res
        .status(403)
        .json({ error: 'No permission to update settings' });
    }

    // Implement settings update logic here
    res.json({ message: 'Server settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update server settings' });
  }
});

module.exports = router;
