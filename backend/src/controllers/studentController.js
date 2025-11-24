const { listStudentsInClass } = require('../services/s3Service');
const { sanitizeClassName } = require('../utils/validation');

/**
 * GET /api/students/:className - Get all students in a class
 */
async function getStudentsByClass(req, res) {
  try {
    const { className } = req.params;

    if (!className) {
      return res.status(400).json({
        success: false,
        error: 'Class name is required',
      });
    }

    // Sanitize class name
    const sanitizedClassName = sanitizeClassName(className);

    // Get students from S3
    const students = await listStudentsInClass(sanitizedClassName);

    res.json({
      success: true,
      className: sanitizedClassName,
      count: students.length,
      students: students,
    });
  } catch (error) {
    console.error('Get Students Error:', error);

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
  getStudentsByClass,
};
