const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateAdmin);

router.get('/', attendanceController.getAttendanceByDate);
router.get('/employee/:id', attendanceController.getAttendanceByEmployee);
router.get('/range', attendanceController.getAttendanceByRange);
router.post('/', attendanceController.markAttendance);
router.put('/:id', attendanceController.updateAttendance);
router.delete('/:id', attendanceController.deleteAttendance);

module.exports = router;
