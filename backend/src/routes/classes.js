const express = require('express');
const router = express.Router();
const { getClasses, postCreateClass } = require('../controllers/classController');

// GET /api/classes - List all classes
router.get('/', getClasses);

// POST /api/classes - Create a new class
router.post('/', postCreateClass);

module.exports = router;
