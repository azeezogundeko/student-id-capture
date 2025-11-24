const { verifyAdminPassword, generateToken } = require('../utils/auth');
const { listAllClasses, listStudentsInClass } = require('../services/s3Service');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, BUCKET_NAME } = require('../config/s3');
const archiver = require('archiver');
const { Readable } = require('stream');

/**
 * POST /api/admin/login - Admin login
 */
async function postAdminLogin(req, res) {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required',
      });
    }

    // Verify password
    const isValid = await verifyAdminPassword(password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password',
      });
    }

    // Generate token
    const token = generateToken({
      isAdmin: true,
      loginTime: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: token,
        expiresIn: '24h',
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
}

/**
 * GET /api/admin/classes - Get all classes with students
 */
async function getAdminClasses(req, res) {
  try {
    // Get all classes
    const classes = await listAllClasses();

    // For each class, get students
    const classesWithStudents = await Promise.all(
      classes.map(async (classItem) => {
        const students = await listStudentsInClass(classItem.className);
        return {
          className: classItem.className,
          studentCount: students.length,
          students: students,
          lastUpdated: students.length > 0
            ? students.reduce((latest, student) =>
                new Date(student.lastModified) > new Date(latest.lastModified)
                  ? student
                  : latest
              ).lastModified
            : null,
        };
      })
    );

    // Sort by last updated (most recent first)
    classesWithStudents.sort((a, b) => {
      if (!a.lastUpdated) return 1;
      if (!b.lastUpdated) return -1;
      return new Date(b.lastUpdated) - new Date(a.lastUpdated);
    });

    res.json({
      success: true,
      count: classesWithStudents.length,
      totalStudents: classesWithStudents.reduce((sum, c) => sum + c.studentCount, 0),
      classes: classesWithStudents,
    });
  } catch (error) {
    console.error('Get admin classes error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/admin/download/image/:className/:studentName - Download single image
 */
async function downloadImage(req, res) {
  try {
    const { className, studentName } = req.params;

    if (!className || !studentName) {
      return res.status(400).json({
        success: false,
        error: 'Class name and student name are required',
      });
    }

    const key = `${className}/${studentName}.jpeg`;

    // Get object from S3
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    // Set headers for download
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${studentName}.jpeg"`);

    // Pipe the S3 stream to response
    if (response.Body instanceof Readable) {
      response.Body.pipe(res);
    } else {
      // Handle buffer or other types
      res.send(response.Body);
    }
  } catch (error) {
    console.error('Download image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download image',
    });
  }
}

/**
 * GET /api/admin/download/class/:className - Download all images in class as ZIP
 */
async function downloadClass(req, res) {
  try {
    const { className } = req.params;

    if (!className) {
      return res.status(400).json({
        success: false,
        error: 'Class name is required',
      });
    }

    // Get all students in class
    const students = await listStudentsInClass(className);

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No students found in this class',
      });
    }

    // Set headers for ZIP download
    const zipFileName = `${className.replace(/\s+/g, '_')}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    // Handle errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      throw err;
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add each student's image to the archive
    for (const student of students) {
      try {
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: student.key,
        });

        const response = await s3Client.send(command);

        if (response.Body instanceof Readable) {
          // Add stream to archive
          archive.append(response.Body, {
            name: `${student.studentName}.jpeg`,
          });
        } else {
          // Handle buffer
          archive.append(response.Body, {
            name: `${student.studentName}.jpeg`,
          });
        }
      } catch (error) {
        console.error(`Failed to add ${student.studentName} to archive:`, error);
        // Continue with other students
      }
    }

    // Finalize archive
    await archive.finalize();
  } catch (error) {
    console.error('Download class error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to download class',
      });
    }
  }
}

/**
 * GET /api/admin/stats - Get statistics
 */
async function getAdminStats(req, res) {
  try {
    const classes = await listAllClasses();

    let totalStudents = 0;
    let totalSize = 0;
    let recentUploads = [];

    for (const classItem of classes) {
      const students = await listStudentsInClass(classItem.className);
      totalStudents += students.length;
      totalSize += students.reduce((sum, s) => sum + (s.size || 0), 0);
      recentUploads.push(...students.map(s => ({
        ...s,
        className: classItem.className,
      })));
    }

    // Sort by last modified and get top 10
    recentUploads.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    recentUploads = recentUploads.slice(0, 10);

    res.json({
      success: true,
      stats: {
        totalClasses: classes.length,
        totalStudents: totalStudents,
        totalSize: totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        recentUploads: recentUploads,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  postAdminLogin,
  getAdminClasses,
  downloadImage,
  downloadClass,
  getAdminStats,
};
