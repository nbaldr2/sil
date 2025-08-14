const express = require('express');
const router = express.Router();
const { getPlugins, installPlugin, uninstallPlugin } = require('../controllers/plugins');

// Get all plugins
router.get('/', getPlugins);

// Install a plugin
router.post('/install/:id', installPlugin);

// Uninstall a plugin
router.delete('/:id/uninstall', uninstallPlugin);

module.exports = router;
