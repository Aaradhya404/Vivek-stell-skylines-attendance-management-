const express = require('express');
const holidayController = require('../controllers/holidayController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateAdmin);

router.get('/', holidayController.getAllHolidays);
router.post('/', holidayController.createHoliday);
router.delete('/:id', holidayController.deleteHoliday);

module.exports = router;
