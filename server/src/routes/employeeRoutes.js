const express = require('express');
const employeeController = require('../controllers/employeeController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all employee routes
router.use(authenticateAdmin);

router.get('/', employeeController.getAllEmployees);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.patch('/:id/toggle-active', employeeController.toggleActive);

module.exports = router;
