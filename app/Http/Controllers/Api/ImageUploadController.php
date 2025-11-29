<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\S3Service;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Response;

/**
 * @OA\Tag(
 *     name="Image Upload",
 *     description="API Endpoints for image upload and management"
 * )
 */
class ImageUploadController extends Controller
{
    protected $s3Service;

    public function __construct(S3Service $s3Service)
    {
        $this->s3Service = $s3Service;
    }

    /**
     * @OA\Post(
     *     path="/api/upload/image",
     *     operationId="uploadSingleImage",
     *     tags={"Image Upload"},
     *     summary="Upload single image",
     *     description="Upload a single image to S3 storage",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"image"},
     *                 @OA\Property(property="image", type="string", format="binary", description="Image file (jpeg, png, jpg, gif, webp, max 2MB)"),
     *                 @OA\Property(property="directory", type="string", example="uploads", description="Directory path in S3")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Image uploaded successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Image uploaded successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="url", type="string", example="https://s3.amazonaws.com/bucket/path/image.jpg"),
     *                 @OA\Property(property="filename", type="string", example="image.jpg"),
     *                 @OA\Property(property="size", type="integer", example=102400),
     *                 @OA\Property(property="mime_type", type="string", example="image/jpeg")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=500, description="Upload failed")
     * )
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
     * @OA\Post(
     *     path="/api/upload/images",
     *     operationId="uploadMultipleImages",
     *     tags={"Image Upload"},
     *     summary="Upload multiple images",
     *     description="Upload multiple images to S3 storage (max 10 images)",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"images"},
     *                 @OA\Property(property="images", type="array", @OA\Items(type="string", format="binary"), description="Image files (1-10 images)"),
     *                 @OA\Property(property="directory", type="string", example="uploads", description="Directory path in S3")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="All images uploaded successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="All images uploaded successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="uploaded", type="array", @OA\Items(type="object")),
     *                 @OA\Property(property="failed", type="array", @OA\Items(type="object"))
     *             )
     *         )
     *     ),
     *     @OA\Response(response=207, description="Partial success - some images failed"),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=500, description="All uploads failed")
     * )
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
     * @OA\Delete(
     *     path="/api/upload/image",
     *     operationId="deleteImage",
     *     tags={"Image Upload"},
     *     summary="Delete image",
     *     description="Delete an image from S3 storage",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"url"},
     *             @OA\Property(property="url", type="string", format="url", example="https://s3.amazonaws.com/bucket/path/image.jpg")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Image deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Image deleted successfully")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
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
