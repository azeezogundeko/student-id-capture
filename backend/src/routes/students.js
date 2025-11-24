const express = require('express');
const router = express.Router();
const { getStudentsByClass } = require('../controllers/studentController');

// GET /api/students/:className - Get all students in a class
router.get('/:className', getStudentsByClass);

module.exports = router;
