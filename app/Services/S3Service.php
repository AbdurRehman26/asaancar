<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class S3Service
{
    protected $disk;

    public function __construct()
    {
        $this->disk = env('FILESYSTEM_DISK') === 's3' ? 's3' : 'public';
    }

    /**
     * Upload a file to Storage (S3 or Public)
     *
     * @param UploadedFile|null $file
     * @param string $directory
     * @param string|null $filename
     * @return string|null
     */
    public function uploadFile(?UploadedFile $file, string $directory = 'uploads', ?string $filename = null): ?string
    {
        if (!$file) {
            return null;
        }

        try {
            // Generate unique filename if not provided
            if (!$filename) {
                $extension = $file->getClientOriginalExtension();
                $filename = Str::uuid() . '.' . $extension;
            }

            // Create the full path
            $path = $directory . '/' . $filename;

            // Upload to Storage
            $uploaded = Storage::disk($this->disk)->put($path, $file->get());

            if ($uploaded) {
                // Return the full URL
                return Storage::disk($this->disk)->url($path);
            }

            return null;
        } catch (\Exception $e) {
            \Log::error('Storage upload failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Upload multiple files to S3
     *
     * @param array $files
     * @param string $directory
     * @return array
     */
    public function uploadMultipleFiles(array $files, string $directory = 'uploads'): array
    {
        $uploadedUrls = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $url = $this->uploadFile($file, $directory);
                if ($url) {
                    $uploadedUrls[] = $url;
                }
            }
        }

        return $uploadedUrls;
    }

    /**
     * Delete a file from S3
     *
     * @param string $url
     * @return bool
     */
    public function deleteFile(string $url): bool
    {
        try {
            // Extract the path from the URL
            $path = parse_url($url, PHP_URL_PATH);
            
            if ($path) {
                // If using public disk, we need to remove '/storage' prefix if present
                if ($this->disk === 'public' && strpos($path, '/storage') === 0) {
                    $path = substr($path, 8); // Remove '/storage'
                }
                
                // Remove leading slash
                $path = ltrim($path, '/');
                
                return Storage::disk($this->disk)->delete($path);
            }
            return false;
        } catch (\Exception $e) {
            \Log::error('Storage delete failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete multiple files from S3
     *
     * @param array $urls
     * @return bool
     */
    public function deleteMultipleFiles(array $urls): bool
    {
        $success = true;

        foreach ($urls as $url) {
            if (!$this->deleteFile($url)) {
                $success = false;
            }
        }

        return $success;
    }
}
