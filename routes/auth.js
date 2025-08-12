const express = require('express');
const router = express.Router();

// Basic auth routes
router.post('/register', (req, res) => {
  res.json({ message: 'Registration endpoint ready' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint ready' });
});

module.exports = router;
