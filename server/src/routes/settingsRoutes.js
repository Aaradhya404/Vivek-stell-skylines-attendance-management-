const express = require('express');
const settingsController = require('../controllers/settingsController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateAdmin);

router.put('/password', settingsController.changePassword);

module.exports = router;
