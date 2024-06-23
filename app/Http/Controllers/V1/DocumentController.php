<?php

namespace App\Http\Controllers\V1;

use App\Http\Requests\V1\Document\DocumentStoreRequest;
use App\Http\Resources\V1\DocumentResource;
use App\Models\Document;
use App\Services\V1\Document\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;

class DocumentController extends Controller
{
    public function __construct(public DocumentService $documentService)
    {
    }

    public function index(): AnonymousResourceCollection
    {
        return DocumentResource::collection(
            $this->documentService->getDocuments()
        );
    }

    public function store(DocumentStoreRequest $documentStoreRequest): JsonResponse|DocumentResource
    {
        try {

            $document = $this->documentService->create(
                $documentStoreRequest->safe(['is_verified', 'documentable_id', 'documentable_type', 'document_type', 'document_url'])
            );

            return new DocumentResource($document);

        }catch (\Exception $exception){
            return new JsonResponse(
                [
                    'error' => $exception->getMessage(),
                ],
                Response::HTTP_BAD_REQUEST
            );
        }
    }

    public function update(Document $document, DocumentStoreRequest $documentStoreRequest): JsonResponse|DocumentResource
    {
        try {

            $this->documentService->update($document,
                $documentStoreRequest->safe(['is_verified', 'documentable_id', 'documentable_type', 'document_type', 'document_url'])
            );

            return new DocumentResource($document->refresh());

        }catch (\Exception $exception){
            return new JsonResponse(
                [
                    'error' => $exception->getMessage(),
                ],
                Response::HTTP_BAD_REQUEST
            );
        }
    }
}
