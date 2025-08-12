# S3 Bucket Setup for Image Uploads

This application now supports S3 bucket image uploads for car images in the dashboard. Here's how to set it up:

## Prerequisites

1. AWS Account with S3 access
2. S3 bucket created
3. AWS credentials (Access Key ID and Secret Access Key)

## Installation

The required packages are already installed, but if you need to reinstall them:

```bash
composer require aws/aws-sdk-php
composer require league/flysystem-aws-s3-v3
```

## Environment Configuration

Add the following environment variables to your `.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket-name
AWS_USE_PATH_STYLE_ENDPOINT=false

# Set default filesystem to S3
FILESYSTEM_DISK=s3
```

## S3 Bucket Configuration

1. **Create an S3 bucket** in your AWS console
2. **Configure CORS** for your bucket to allow uploads from your domain:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

3. **Set bucket permissions** to allow public read access for images (optional, for public image access)

## Features Implemented

### 1. S3Service Class
- `uploadFile()`: Upload single file to S3
- `uploadMultipleFiles()`: Upload multiple files to S3
- `deleteFile()`: Delete single file from S3
- `deleteMultipleFiles()`: Delete multiple files from S3

### 2. Car Controller Integration
- **Create Car**: Images are uploaded to S3 when creating a new car
- **Update Car**: Old images are deleted from S3 when new images are uploaded
- **Delete Car**: All car images are deleted from S3 when car is deleted

### 3. Filament Admin Integration
- File uploads in Filament admin panel now use S3 disk
- Images are stored in `car-images/` directory in S3

### 4. Frontend Integration
- The create-car form already supports multiple image uploads
- Images are sent as FormData to the API
- S3 URLs are returned and stored in the database

## Directory Structure

Images are organized in S3 as follows:
```
your-bucket/
├── car-images/
│   ├── uuid1.jpg
│   ├── uuid2.png
│   └── ...
└── other-uploads/
```

## Testing

Run the S3 service tests:
```bash
php artisan test tests/Unit/S3ServiceTest.php
```

## Troubleshooting

1. **Upload fails**: Check AWS credentials and bucket permissions
2. **Images not displaying**: Verify CORS configuration and bucket public access
3. **Delete fails**: Check bucket permissions for delete operations

## Security Considerations

1. Use IAM roles with minimal required permissions
2. Consider using pre-signed URLs for secure uploads
3. Implement file size and type validation
4. Use bucket policies to restrict access if needed

## Migration from Local Storage

If you're migrating from local storage to S3:

1. Update your `.env` file with S3 configuration
2. Set `FILESYSTEM_DISK=s3`
3. Existing local images will need to be migrated manually
4. New uploads will automatically use S3
