<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\S3Service;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Response;

class ImageUploadController extends Controller
{
    protected $s3Service;

    public function __construct(S3Service $s3Service)
    {
        $this->s3Service = $s3Service;
    }

    /**
     * Upload a single image
     */
    public function uploadSingle(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'directory' => 'nullable|string|max:100'
        ]);

        $file = $request->file('image');
        $directory = $request->input('directory', 'uploads');

        $imageUrl = $this->s3Service->uploadFile($file, $directory);

        if (!$imageUrl) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Image uploaded successfully',
            'data' => [
                'url' => $imageUrl,
                'filename' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType()
            ]
        ]);
    }

    /**
     * Upload multiple images
     */
    public function uploadMultiple(Request $request): JsonResponse
    {
        $request->validate([
            'images' => 'required|array|min:1|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'directory' => 'nullable|string|max:100'
        ]);

        $files = $request->file('images');
        $directory = $request->input('directory', 'uploads');

        $uploadedImages = [];
        $failedUploads = [];

        foreach ($files as $index => $file) {
            $imageUrl = $this->s3Service->uploadFile($file, $directory);

            if ($imageUrl) {
                $uploadedImages[] = [
                    'url' => $imageUrl,
                    'filename' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'index' => $index
                ];
            } else {
                $failedUploads[] = [
                    'filename' => $file->getClientOriginalName(),
                    'index' => $index
                ];
            }
        }

        // If all uploads failed, return error
        if (empty($uploadedImages) && !empty($failedUploads)) {
            return response()->json([
                'success' => false,
                'message' => 'All image uploads failed',
                'data' => [
                    'uploaded' => [],
                    'failed' => $failedUploads
                ]
            ], 500);
        }

        // If some uploads failed, return partial success with warning
        if (!empty($failedUploads)) {
            return response()->json([
                'success' => true,
                'message' => 'Some images failed to upload',
                'data' => [
                    'uploaded' => $uploadedImages,
                    'failed' => $failedUploads
                ]
            ], 207); // 207 Multi-Status for partial success
        }

        // All uploads successful
        return response()->json([
            'success' => true,
            'message' => 'All images uploaded successfully',
            'data' => [
                'uploaded' => $uploadedImages,
                'failed' => []
            ]
        ]);
    }

    /**
     * Delete an image
     */
    public function delete(Request $request): JsonResponse
    {
        $request->validate([
            'url' => 'required|url'
        ]);

        $deleted = $this->s3Service->deleteFile($request->input('url'));

        return response()->json([
            'success' => $deleted,
            'message' => $deleted ? 'Image deleted successfully' : 'Failed to delete image'
        ]);
    }

    /**
     * Serve an image from S3
     */
    public function serveImage(Request $request): Response
    {
        $request->validate([
            'path' => 'required|string'
        ]);

        $path = $request->input('path');

        try {
            if (!Storage::disk('s3')->exists($path)) {
                abort(404, 'Image not found');
            }

            $file = Storage::disk('s3')->get($path);
            $mimeType = Storage::disk('s3')->mimeType($path);

            return response($file, 200, [
                'Content-Type' => $mimeType,
                'Cache-Control' => 'public, max-age=3600',
            ]);
        } catch (\Exception $e) {
            abort(404, 'Image not found');
        }
    }
}
