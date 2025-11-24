const {
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, BUCKET_NAME } = require('../config/s3');

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - File content
 * @param {string} className - Class name (folder)
 * @param {string} studentName - Student name (filename)
 * @param {string} contentType - File MIME type
 * @returns {Promise<object>}
 */
async function uploadToS3(fileBuffer, className, studentName, contentType) {
  const key = `${className}/${studentName}.jpeg`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    Metadata: {
      uploadedAt: new Date().toISOString(),
      className: className,
      studentName: studentName,
    },
  });

  try {
    await s3Client.send(command);
    return {
      success: true,
      key: key,
      bucket: BUCKET_NAME,
      url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
}

/**
 * Generate a pre-signed URL for uploading
 * @param {string} className
 * @param {string} studentName
 * @returns {Promise<string>}
 */
async function generatePresignedUploadUrl(className, studentName) {
  const key = `${className}/${studentName}.jpeg`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: 'image/jpeg',
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes
    return signedUrl;
  } catch (error) {
    console.error('Pre-signed URL Error:', error);
    throw new Error(`Failed to generate pre-signed URL: ${error.message}`);
  }
}

/**
 * List all students in a class
 * @param {string} className
 * @returns {Promise<Array>}
 */
async function listStudentsInClass(className) {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: `${className}/`,
    Delimiter: '/',
  });

  try {
    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      return [];
    }

    // Generate pre-signed URLs for viewing images
    const students = await Promise.all(
      response.Contents.map(async (item) => {
        const studentName = item.Key.replace(`${className}/`, '').replace('.jpeg', '');

        // Generate pre-signed URL for viewing (valid for 1 hour)
        const getCommand = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: item.Key,
        });

        const viewUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

        return {
          studentName: studentName,
          key: item.Key,
          size: item.Size,
          lastModified: item.LastModified,
          url: viewUrl,
        };
      })
    );

    return students;
  } catch (error) {
    console.error('List Students Error:', error);
    throw new Error(`Failed to list students: ${error.message}`);
  }
}

/**
 * List all classes (folders) in the bucket
 * @returns {Promise<Array>}
 */
async function listAllClasses() {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Delimiter: '/',
  });

  try {
    const response = await s3Client.send(command);

    if (!response.CommonPrefixes || response.CommonPrefixes.length === 0) {
      return [];
    }

    const classes = response.CommonPrefixes.map((prefix) => {
      const className = prefix.Prefix.replace('/', '');
      return {
        className: className,
        prefix: prefix.Prefix,
      };
    });

    return classes;
  } catch (error) {
    console.error('List Classes Error:', error);
    throw new Error(`Failed to list classes: ${error.message}`);
  }
}

/**
 * Create a class by uploading a marker file
 * @param {string} className
 * @returns {Promise<object>}
 */
async function createClass(className) {
  // Create a marker file to establish the folder
  const key = `${className}/.classinfo`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: JSON.stringify({
      className: className,
      createdAt: new Date().toISOString(),
    }),
    ContentType: 'application/json',
  });

  try {
    await s3Client.send(command);
    return {
      success: true,
      className: className,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Create Class Error:', error);
    throw new Error(`Failed to create class: ${error.message}`);
  }
}

module.exports = {
  uploadToS3,
  generatePresignedUploadUrl,
  listStudentsInClass,
  listAllClasses,
  createClass,
};
