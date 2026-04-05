import { apiFetch } from '@/lib/utils';
import { ImagePlus, LoaderCircle, Trash2, X } from 'lucide-react';
import React, { useCallback, useState } from 'react';

export interface UploadedImage {
    url: string;
    filename: string;
    size: number;
    mime_type: string;
}

interface FailedUpload {
    filename: string;
    index: number;
}

interface UploadImagesResponse {
    success: boolean;
    message?: string;
    data: {
        uploaded: UploadedImage[];
        failed: FailedUpload[];
    };
}

interface ImageUploadProps {
    onImagesChange: (images: UploadedImage[]) => void;
    maxImages?: number;
    directory?: string;
    className?: string;
    disabled?: boolean;
}

export default function ImageUpload({ onImagesChange, maxImages = 5, directory = 'uploads', className = '', disabled = false }: ImageUploadProps) {
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    const deleteImageByUrl = useCallback(async (imageUrl: string): Promise<void> => {
        const response = await apiFetch('/api/upload/image', {
            method: 'DELETE',
            body: JSON.stringify({ url: imageUrl }),
        });

        if (!response.ok) {
            throw new Error('Failed to delete image');
        }
    }, []);

    const uploadImages = useCallback(
        async (files: FileList | File[]) => {
            const selectedFiles = Array.from(files);
            const filesToUpload = maxImages === 1 ? selectedFiles.slice(-1) : selectedFiles;

            if (filesToUpload.length === 0) {
                return;
            }

            if (maxImages !== 1 && uploadedImages.length + filesToUpload.length > maxImages) {
                setError(`You can only upload up to ${maxImages} images`);
                return;
            }

            setUploading(true);
            setError(null);
            setWarning(null);

            try {
                const formData = new FormData();
                filesToUpload.forEach((file) => {
                    formData.append('images[]', file);
                });
                formData.append('directory', directory);

                const response = await apiFetch('/api/upload/images', {
                    method: 'POST',
                    body: formData,
                });

                const result = (await response.json()) as UploadImagesResponse;

                if (response.ok && result.success) {
                    const nextUploadedImages = maxImages === 1 ? result.data.uploaded.slice(-1) : [...uploadedImages, ...result.data.uploaded];

                    setUploadedImages(nextUploadedImages);
                    onImagesChange(nextUploadedImages);

                    if (response.status === 207 && result.data.failed.length > 0) {
                        const failedFiles = result.data.failed.map((file) => file.filename).join(', ');
                        setWarning(`Some images failed to upload: ${failedFiles}`);
                    }

                    if (maxImages === 1 && uploadedImages[0]?.url && uploadedImages[0].url !== nextUploadedImages[0]?.url) {
                        try {
                            await deleteImageByUrl(uploadedImages[0].url);
                        } catch (deleteError) {
                            console.error('Replace cleanup error:', deleteError);
                        }
                    }
                } else if (response.status === 500) {
                    setError('All image uploads failed. Please try again.');
                } else if (result.message) {
                    setError(result.message);
                } else {
                    setError('Upload failed');
                }
            } catch (uploadError) {
                console.error('Upload error:', uploadError);
                setError('Upload failed - network error');
            } finally {
                setUploading(false);
            }
        },
        [deleteImageByUrl, directory, maxImages, onImagesChange, uploadedImages],
    );

    const deleteImage = useCallback(
        async (imageUrl: string, index: number) => {
            try {
                await deleteImageByUrl(imageUrl);

                const nextUploadedImages = uploadedImages.filter((_, currentIndex) => currentIndex !== index);
                setUploadedImages(nextUploadedImages);
                onImagesChange(nextUploadedImages);
            } catch (deleteError) {
                console.error('Delete error:', deleteError);
                setError('Failed to delete image');
            }
        },
        [deleteImageByUrl, onImagesChange, uploadedImages],
    );

    const handleDrag = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (event.type === 'dragenter' || event.type === 'dragover') {
            setDragActive(true);
        } else if (event.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            event.stopPropagation();
            setDragActive(false);

            if (event.dataTransfer.files && event.dataTransfer.files[0]) {
                uploadImages(event.dataTransfer.files);
            }
        },
        [uploadImages],
    );

    const handleFileSelect = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.files && event.target.files[0]) {
                uploadImages(event.target.files);
            }
        },
        [uploadImages],
    );

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) {
            return '0 Bytes';
        }

        const kilobyte = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const sizeIndex = Math.floor(Math.log(bytes) / Math.log(kilobyte));

        return `${parseFloat((bytes / Math.pow(kilobyte, sizeIndex)).toFixed(2))} ${sizes[sizeIndex]}`;
    };

    return (
        <div className={className}>
            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-center">
                        <div className="shrink-0">
                            <X className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {warning && (
                <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <div className="flex items-center">
                        <div className="shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-800">{warning}</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button type="button" onClick={() => setWarning(null)} className="text-yellow-400 hover:text-yellow-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div
                className={`relative overflow-hidden rounded-xl border border-dashed p-5 text-left transition-all ${
                    dragActive ? 'border-[#7e246c] bg-[#7e246c]/5' : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
                } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-[#7e246c]/60'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    multiple={maxImages > 1}
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    disabled={disabled || uploading}
                />

                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7e246c]/10 text-[#7e246c] dark:bg-[#7e246c]/15">
                        {uploading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {uploading ? 'Uploading your image...' : maxImages === 1 ? 'Upload a new profile photo' : 'Upload your images'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Drag and drop here, or click to browse from your device.</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, GIF, WEBP up to 2MB each. {uploadedImages.length}/{maxImages} uploaded.
                        </p>
                    </div>
                </div>
            </div>

            {uploadedImages.length > 0 && maxImages > 1 && (
                <div className="mt-4">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {uploadedImages.map((image, index) => (
                            <div
                                key={image.url}
                                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
                            >
                                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
                                    <img
                                        src={image.url}
                                        alt={image.filename}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(event) => {
                                            const target = event.target as HTMLImageElement;
                                            target.src = '/images/car-placeholder.jpeg';
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => deleteImage(image.url, index)}
                                    className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-all group-hover:opacity-100 hover:bg-red-600 sm:opacity-0"
                                    disabled={disabled}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="mt-3">
                                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{image.filename}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(image.size)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
