import React, { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/utils';
import { X, Upload } from 'lucide-react';

interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  mime_type: string;
}

interface FailedUpload {
  filename: string;
  index: number;
}

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  directory?: string;
  className?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  onImagesChange,
  maxImages = 5,
  directory = 'uploads',
  className = '',
  disabled = false
}: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);



  const uploadImages = useCallback(async (files: FileList | File[]) => {
    if (uploadedImages.length + files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);
    setError(null);
    setWarning(null);
    
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('images[]', file);
      });
      formData.append('directory', directory);

      const response = await apiFetch('/api/upload/images', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Handle different success scenarios
        if (response.status === 207) {
          // Partial success - some images failed
          const newImages = [...uploadedImages, ...result.data.uploaded];
          setUploadedImages(newImages);
          onImagesChange(newImages);
          
          // Show warning about failed uploads
          if (result.data.failed.length > 0) {
            const failedFiles = result.data.failed.map((f: FailedUpload) => f.filename).join(', ');
            setWarning(`Some images failed to upload: ${failedFiles}`);
          }
        } else {
          // Complete success
          const newImages = [...uploadedImages, ...result.data.uploaded];
          setUploadedImages(newImages);
          onImagesChange(newImages);
        }
      } else {
        // Handle error responses
        if (response.status === 500) {
          setError('All image uploads failed. Please try again.');
        } else if (result.message) {
          setError(result.message);
        } else {
          setError('Upload failed');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed - network error');
    } finally {
      setUploading(false);
    }
  }, [uploadedImages, maxImages, directory, onImagesChange]);

  const deleteImage = useCallback(async (imageUrl: string, index: number) => {
    try {
      const response = await apiFetch('/api/upload/image', {
        method: 'DELETE',
        body: JSON.stringify({ url: imageUrl }),
      });

      if (response.ok) {
        const newImages = uploadedImages.filter((_, i) => i !== index);
        setUploadedImages(newImages);
        onImagesChange(newImages);
      } else {
        setError('Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete image');
    }
  }, [uploadedImages, onImagesChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadImages(e.dataTransfer.files);
    }
  }, [uploadImages]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadImages(e.target.files);
    }
  }, [uploadImages]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Message */}
      {warning && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">{warning}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setWarning(null)}
                className="text-yellow-400 hover:text-yellow-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled || uploading}
        />
        
        <div className="flex flex-col items-center space-y-2">
          <Upload className={`w-8 h-8 ${uploading ? 'animate-pulse' : ''}`} />
          <div>
            <p className="text-sm font-medium">
              {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF, WEBP up to 2MB each
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {uploadedImages.length}/{maxImages} images uploaded
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Uploaded Images:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/car-placeholder.jpeg';
                    }}
                  />
                </div>
                
                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => deleteImage(image.url, index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* Image Info */}
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <p className="truncate">{image.filename}</p>
                  <p>{formatFileSize(image.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
