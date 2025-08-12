# Direct Image Upload System

This application now implements a direct image upload system where images are uploaded immediately when selected, and the returned image objects/URLs are then passed to other APIs (store creation, add car, etc.).

## 🚀 **How It Works**

### 1. **Direct Image Upload API**
- **Endpoint**: `/api/upload/images` (multiple) or `/api/upload/image` (single)
- **Method**: POST
- **Authentication**: Required (auth:sanctum middleware)
- **Response**: Returns image objects with URLs, filenames, sizes, and MIME types

### 2. **Image Upload Flow**
```
1. User selects images → 
2. Images uploaded immediately to S3 → 
3. Image URLs returned → 
4. URLs stored in form state → 
5. URLs sent with form submission
```

## 📁 **API Endpoints**

### Upload Multiple Images
```http
POST /api/upload/images
Content-Type: multipart/form-data

Form Data:
- images[]: File (multiple)
- directory: string (optional, default: 'uploads')
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "All images uploaded successfully",
  "data": {
    "uploaded": [
      {
        "url": "https://s3.amazonaws.com/bucket/car-images/uuid.jpg",
        "filename": "car1.jpg",
        "size": 1024000,
        "mime_type": "image/jpeg",
        "index": 0
      }
    ],
    "failed": []
  }
}
```

**Partial Success Response (207):**
```json
{
  "success": true,
  "message": "Some images failed to upload",
  "data": {
    "uploaded": [
      {
        "url": "https://s3.amazonaws.com/bucket/car-images/uuid.jpg",
        "filename": "car1.jpg",
        "size": 1024000,
        "mime_type": "image/jpeg",
        "index": 0
      }
    ],
    "failed": [
      {
        "filename": "failed-image.jpg",
        "index": 1
      }
    ]
  }
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "All image uploads failed",
  "data": {
    "uploaded": [],
    "failed": [
      {
        "filename": "failed-image1.jpg",
        "index": 0
      },
      {
        "filename": "failed-image2.jpg",
        "index": 1
      }
    ]
  }
}
```

### Upload Single Image
```http
POST /api/upload/image
Content-Type: multipart/form-data

Form Data:
- image: File
- directory: string (optional, default: 'uploads')
```

### Delete Image
```http
DELETE /api/upload/image
Content-Type: application/json

Body:
{
  "url": "https://s3.amazonaws.com/bucket/car-images/uuid.jpg"
}
```

## 🧩 **Reusable ImageUpload Component**

### Features
- **Drag & Drop**: Support for drag and drop file uploads
- **Multiple Images**: Upload up to configurable number of images
- **Preview**: Real-time image preview with file info
- **Delete**: Remove individual images with S3 cleanup
- **Progress**: Upload progress indication
- **Validation**: File type and size validation
- **Error Handling**: Inline error and warning messages (no popups)

### Usage
```tsx
import ImageUpload from '@/components/ImageUpload';

<ImageUpload
  onImagesChange={(images) => setUploadedImages(images)}
  maxImages={5}
  directory="car-images"
  disabled={loading}
/>
```

### Props
- `onImagesChange`: Callback when images change
- `maxImages`: Maximum number of images (default: 5)
- `directory`: S3 directory for uploads (default: 'uploads')
- `className`: Additional CSS classes
- `disabled`: Disable upload functionality

## 📝 **Integration Examples**

### Create Car Form
```tsx
const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

const handleSubmit = async (e: React.FormEvent) => {
  const formData = new FormData();
  // ... other form data
  uploadedImages.forEach(img => {
    formData.append('image_urls[]', img.url);
  });
  
  await apiFetch('/api/customer/cars', {
    method: 'POST',
    body: formData,
  });
};

<ImageUpload
  onImagesChange={setUploadedImages}
  maxImages={5}
  directory="car-images"
/>
```

### Create Store Form
```tsx
const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

const handleSubmit = async (e: React.FormEvent) => {
  const formData = new FormData();
  // ... other form data
  if (uploadedImages.length > 0) {
    formData.append('logo_url', uploadedImages[0].url);
  }
  
  await apiFetch('/api/customer/stores', {
    method: 'POST',
    body: formData,
  });
};

<ImageUpload
  onImagesChange={setUploadedImages}
  maxImages={1}
  directory="store-logos"
/>
```

## 🔧 **Backend Changes**

### Updated Controllers
- **CarController**: Now accepts image URLs instead of file uploads
- **StoreController**: Accepts logo_url for store logos
- **ImageUploadController**: New controller for direct image uploads

### Updated Validation
- **CreateCarRequest**: Validates image URLs instead of files
- **CreateStoreRequest**: Added logo_url validation
- **ImageUploadController**: Validates uploaded files

### S3 Integration
- Images uploaded to S3 immediately
- Unique UUID filenames prevent conflicts
- Automatic cleanup when images are deleted
- Organized directory structure

## 🎯 **Benefits**

1. **Better UX**: Immediate feedback on image uploads
2. **Separation of Concerns**: Image upload separate from form submission
3. **Reusability**: Single component for all image uploads
4. **Error Handling**: Better error handling for upload failures
5. **Progress Tracking**: Visual feedback during uploads
6. **Cleanup**: Automatic S3 cleanup for deleted images

## 🔒 **Security**

- **Authentication**: All upload endpoints require authentication
- **File Validation**: Type and size validation on both frontend and backend
- **S3 Security**: Proper S3 bucket configuration and permissions
- **URL Validation**: Backend validates image URLs before saving

## 📊 **File Limits**

- **Max File Size**: 2MB per image
- **Allowed Types**: JPEG, PNG, JPG, GIF, WEBP
- **Max Images**: Configurable per form (default: 5)
- **Max Uploads**: 10 images per request

## 🚀 **Usage in Forms**

The new system is now integrated into:
- ✅ **Create Car Form**: Multiple car images
- ✅ **Create Store Form**: Single store logo
- 🔄 **Edit Car Form**: Can be updated similarly
- 🔄 **Edit Store Form**: Can be updated similarly

This system provides a much better user experience with immediate feedback and proper error handling for image uploads.
