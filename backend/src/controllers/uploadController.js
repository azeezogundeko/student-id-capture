const { uploadToS3, generatePresignedUploadUrl } = require('../services/s3Service');
const { sanitizeClassName, sanitizeStudentName, validateImageFile } = require('../utils/validation');

/**
 * POST /api/upload - Upload student photo to S3
 */
async function postUploadPhoto(req, res) {
  try {
    const { className, studentName } = req.body;
    const file = req.file;

    // Validate required fields
    if (!className || !studentName) {
      return res.status(400).json({
        success: false,
        error: 'Class name and student name are required',
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Photo file is required',
      });
    }

    // Sanitize inputs
    const sanitizedClassName = sanitizeClassName(className);
    const sanitizedStudentName = sanitizeStudentName(studentName);

    // Validate file
    validateImageFile(file);

    // Upload to S3
    const result = await uploadToS3(
      file.buffer,
      sanitizedClassName,
      sanitizedStudentName,
      file.mimetype
    );

    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        className: sanitizedClassName,
        studentName: sanitizedStudentName,
        s3Key: result.key,
        url: result.url,
      },
    });
  } catch (error) {
    console.error('Upload Photo Error:', error);

    if (
      error.message.includes('name') ||
      error.message.includes('file type') ||
      error.message.includes('File size')
    ) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload photo: ' + error.message,
    });
  }
}

/**
 * POST /api/upload/presigned - Generate pre-signed URL for client-side upload
 */
async function postGeneratePresignedUrl(req, res) {
  try {
    const { className, studentName } = req.body;

    // Validate required fields
    if (!className || !studentName) {
      return res.status(400).json({
        success: false,
        error: 'Class name and student name are required',
      });
    }

    // Sanitize inputs
    const sanitizedClassName = sanitizeClassName(className);
    const sanitizedStudentName = sanitizeStudentName(studentName);

    // Generate pre-signed URL
    const presignedUrl = await generatePresignedUploadUrl(
      sanitizedClassName,
      sanitizedStudentName
    );

    res.json({
      success: true,
      message: 'Pre-signed URL generated',
      data: {
        uploadUrl: presignedUrl,
        className: sanitizedClassName,
        studentName: sanitizedStudentName,
        expiresIn: 300, // 5 minutes
      },
    });
  } catch (error) {
    console.error('Generate Presigned URL Error:', error);

    if (error.message.includes('name')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate upload URL: ' + error.message,
    });
  }
}

module.exports = {
  postUploadPhoto,
  postGeneratePresignedUrl,
};
