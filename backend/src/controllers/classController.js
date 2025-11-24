const { listAllClasses, createClass } = require('../services/s3Service');
const { sanitizeClassName } = require('../utils/validation');

/**
 * GET /api/classes - List all classes
 */
async function getClasses(req, res) {
  try {
    const classes = await listAllClasses();
    res.json({
      success: true,
      count: classes.length,
      classes: classes,
    });
  } catch (error) {
    console.error('Get Classes Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/classes - Create a new class
 */
async function postCreateClass(req, res) {
  try {
    const { className } = req.body;

    if (!className) {
      return res.status(400).json({
        success: false,
        error: 'Class name is required',
      });
    }

    // Sanitize class name
    const sanitizedClassName = sanitizeClassName(className);

    // Create class in S3
    const result = await createClass(sanitizedClassName);

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      class: result,
    });
  } catch (error) {
    console.error('Create Class Error:', error);

    if (error.message.includes('Class name')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  getClasses,
  postCreateClass,
};
