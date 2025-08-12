const express = require('express');
const router = express.Router();

// Basic analytics routes
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Analytics dashboard ready' });
});

module.exports = router;
