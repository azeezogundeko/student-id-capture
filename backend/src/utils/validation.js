/**
 * Sanitize class name - remove special characters, allow only alphanumeric, spaces, hyphens
 * @param {string} className
 * @returns {string}
 */
function sanitizeClassName(className) {
  if (!className || typeof className !== 'string') {
    throw new Error('Class name is required and must be a string');
  }

  // Remove any character that is not alphanumeric, space, or hyphen
  const sanitized = className.trim().replace(/[^a-zA-Z0-9\s-]/g, '');

  if (sanitized.length === 0) {
    throw new Error('Class name contains no valid characters');
  }

  if (sanitized.length > 100) {
    throw new Error('Class name is too long (max 100 characters)');
  }

  return sanitized;
}

/**
 * Sanitize student name - remove special characters, allow only alphanumeric, spaces, hyphens
 * @param {string} studentName
 * @returns {string}
 */
function sanitizeStudentName(studentName) {
  if (!studentName || typeof studentName !== 'string') {
    throw new Error('Student name is required and must be a string');
  }

  // Remove any character that is not alphanumeric, space, or hyphen
  const sanitized = studentName.trim().replace(/[^a-zA-Z0-9\s-]/g, '');

  if (sanitized.length === 0) {
    throw new Error('Student name contains no valid characters');
  }

  if (sanitized.length > 100) {
    throw new Error('Student name is too long (max 100 characters)');
  }

  return sanitized;
}

/**
 * Validate that file is an image
 * @param {object} file - Multer file object
 * @returns {boolean}
 */
function validateImageFile(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed');
  }

  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default

  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
  }

  return true;
}

module.exports = {
  sanitizeClassName,
  sanitizeStudentName,
  validateImageFile,
};
