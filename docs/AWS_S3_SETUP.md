# AWS S3 Setup Guide

This guide walks you through setting up AWS S3 for the Student Photo Capture System with least-privilege IAM policies.

---

## Prerequisites

- AWS Account
- AWS CLI installed (optional but recommended)
- Basic understanding of AWS IAM and S3

---

## Step 1: Create an S3 Bucket

### Using AWS Console:

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click **"Create bucket"**
3. Configure the bucket:
   - **Bucket name:** `student-photo-capture` (must be globally unique)
   - **AWS Region:** Choose your preferred region (e.g., `us-east-1`)
   - **Block Public Access:** Keep all options checked (recommended for security)
   - **Bucket Versioning:** Optional (can enable for backup)
   - **Default encryption:** Enable (SSE-S3 recommended)
4. Click **"Create bucket"**

### Using AWS CLI:

```bash
aws s3 mb s3://student-photo-capture --region us-east-1

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket student-photo-capture \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Block public access
aws s3api put-public-access-block \
  --bucket student-photo-capture \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

---

## Step 2: Configure CORS (Cross-Origin Resource Sharing)

To allow your frontend to interact with S3 (especially for pre-signed URLs):

### Using AWS Console:

1. Go to your bucket
2. Click **"Permissions"** tab
3. Scroll to **"Cross-origin resource sharing (CORS)"**
4. Click **"Edit"** and paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-frontend-domain.vercel.app"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

5. Click **"Save changes"**

### Using AWS CLI:

Save the CORS configuration to a file `cors.json`:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
      "AllowedOrigins": ["http://localhost:3000", "https://your-frontend-domain.vercel.app"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

Apply the CORS configuration:

```bash
aws s3api put-bucket-cors \
  --bucket student-photo-capture \
  --cors-configuration file://cors.json
```

---

## Step 3: Create IAM User with Least-Privilege Access

### Using AWS Console:

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **"Users"** → **"Add users"**
3. **User name:** `student-photo-capture-app`
4. Select **"Access key - Programmatic access"**
5. Click **"Next: Permissions"**
6. Select **"Attach policies directly"**
7. Click **"Create policy"** (opens new tab)

---

## Step 4: Create IAM Policy (Least Privilege)

### Policy: Read/Write/List Access

In the policy editor, choose JSON and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListBucket",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::student-photo-capture"
    },
    {
      "Sid": "ReadWriteObjects",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::student-photo-capture/*"
    }
  ]
}
```

**Policy Details:**
- `ListBucket` - Allows listing objects (for getting classes and students)
- `GetObject` - Allows reading objects (for viewing photos)
- `PutObject` - Allows uploading objects (for student photos)
- `PutObjectAcl` - Allows setting object permissions (optional)
- `DeleteObject` - Allows deleting objects (optional, can remove if not needed)

**Policy Name:** `StudentPhotoCaptureS3Policy`

Click **"Next"** → **"Create policy"**

### Using AWS CLI:

Save the policy to a file `policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListBucket",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::student-photo-capture"
    },
    {
      "Sid": "ReadWriteObjects",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::student-photo-capture/*"
    }
  ]
}
```

Create the policy:

```bash
aws iam create-policy \
  --policy-name StudentPhotoCaptureS3Policy \
  --policy-document file://policy.json
```

---

## Step 5: Attach Policy to User

### Using AWS Console:

1. Go back to the **"Add user"** tab
2. Refresh the policy list
3. Search for `StudentPhotoCaptureS3Policy`
4. Check the box next to it
5. Click **"Next"** → **"Create user"**

### Using AWS CLI:

```bash
# Create user
aws iam create-user --user-name student-photo-capture-app

# Attach policy (replace ACCOUNT_ID with your AWS account ID)
aws iam attach-user-policy \
  --user-name student-photo-capture-app \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/StudentPhotoCaptureS3Policy

# Create access key
aws iam create-access-key --user-name student-photo-capture-app
```

---

## Step 6: Save Access Keys

After creating the user, you'll see:
- **Access Key ID**
- **Secret Access Key**

**⚠️ IMPORTANT:** Save these credentials securely. You won't be able to see the Secret Access Key again!

Example:
```
Access Key ID: AKIAIOSFODNN7EXAMPLE
Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

---

## Step 7: Configure Environment Variables

### Backend (.env):

Create `/backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
S3_BUCKET_NAME=student-photo-capture

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
```

### Frontend (.env.local):

Create `/frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Step 8: Verify Setup

### Test with AWS CLI:

```bash
# Export credentials
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1

# Test upload
echo "test" > test.txt
aws s3 cp test.txt s3://student-photo-capture/test-class/test.txt

# Test list
aws s3 ls s3://student-photo-capture/

# Test download
aws s3 cp s3://student-photo-capture/test-class/test.txt ./downloaded.txt

# Clean up
aws s3 rm s3://student-photo-capture/test-class/test.txt
rm test.txt downloaded.txt
```

### Test with Backend:

```bash
cd backend
npm install
npm run dev

# In another terminal, test the API
curl http://localhost:5000/health
curl http://localhost:5000/api/classes
```

---

## Security Best Practices

### 1. **Never Commit Credentials**
- Add `.env` to `.gitignore`
- Use environment variables in production
- Rotate access keys regularly

### 2. **Use IAM Roles for EC2/ECS**
If deploying to AWS infrastructure:
- Attach IAM role directly to EC2/ECS
- No need to store credentials in environment variables
- More secure and easier to manage

### 3. **Enable Bucket Versioning**
```bash
aws s3api put-bucket-versioning \
  --bucket student-photo-capture \
  --versioning-configuration Status=Enabled
```

### 4. **Enable Logging**
```bash
# Create logging bucket
aws s3 mb s3://student-photo-capture-logs

# Enable logging
aws s3api put-bucket-logging \
  --bucket student-photo-capture \
  --bucket-logging-status '{
    "LoggingEnabled": {
      "TargetBucket": "student-photo-capture-logs",
      "TargetPrefix": "access-logs/"
    }
  }'
```

### 5. **Set Lifecycle Policies (Optional)**
To automatically delete old photos after a certain period:

```json
{
  "Rules": [
    {
      "Id": "DeleteOldPhotos",
      "Status": "Enabled",
      "Prefix": "",
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
```

---

## Troubleshooting

### Issue: "Access Denied" errors

**Solutions:**
1. Verify IAM policy is attached to the user
2. Check bucket name matches environment variable
3. Ensure CORS is configured correctly
4. Verify access keys are correct

### Issue: Pre-signed URLs not working

**Solutions:**
1. Check CORS configuration includes your frontend origin
2. Verify system time is synchronized (pre-signed URLs are time-sensitive)
3. Ensure bucket region matches `AWS_REGION` environment variable

### Issue: "Bucket not found"

**Solutions:**
1. Verify bucket name is globally unique
2. Check bucket exists in the correct region
3. Ensure IAM user has `s3:ListBucket` permission

---

## Cost Estimation

**S3 Pricing (as of 2024, us-east-1):**
- Storage: $0.023 per GB per month
- PUT requests: $0.005 per 1,000 requests
- GET requests: $0.0004 per 1,000 requests

**Example:**
- 1,000 students × 200KB per photo = 200MB storage
- Monthly cost: ~$0.005 + negligible request costs

**Tips to reduce costs:**
- Use S3 Intelligent-Tiering for infrequent access
- Enable lifecycle policies to delete old photos
- Use CloudFront CDN for high-traffic scenarios

---

## Additional Security: Bucket Policy (Optional)

For extra security, add a bucket policy that restricts access to specific IAM users:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RestrictToIAMUser",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::student-photo-capture",
        "arn:aws:s3:::student-photo-capture/*"
      ],
      "Condition": {
        "StringNotLike": {
          "aws:userid": [
            "AIDAI****************:*",
            "ACCOUNT_ID"
          ]
        }
      }
    }
  ]
}
```

Replace `AIDAI****************` with your IAM user ID.

---

## Support

For AWS-specific issues:
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS IAM Documentation](https://docs.aws.amazon.com/iam/)
- [AWS Support](https://aws.amazon.com/support/)
