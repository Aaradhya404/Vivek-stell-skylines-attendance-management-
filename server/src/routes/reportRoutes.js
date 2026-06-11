const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateAdmin);

router.get('/monthly', reportController.getMonthlyReport);
router.get('/export/pdf', reportController.exportPDF);
router.get('/export/excel', reportController.exportExcel);

module.exports = router;
