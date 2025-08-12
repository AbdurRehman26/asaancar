<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class S3Service
{
    /**
     * Upload a file to S3
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

            // Upload to S3
            $uploaded = Storage::disk('s3')->put($path, $file->get());

            if ($uploaded) {
                // Return the full URL
                return Storage::disk('s3')->url($path);
            }

            return null;
        } catch (\Exception $e) {
            \Log::error('S3 upload failed: ' . $e->getMessage());
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
                // Remove the bucket name from the path if present
                $path = ltrim($path, '/');
                return Storage::disk('s3')->delete($path);
            }
            return false;
        } catch (\Exception $e) {
            \Log::error('S3 delete failed: ' . $e->getMessage());
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
