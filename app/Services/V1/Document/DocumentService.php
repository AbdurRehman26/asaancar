<?php

namespace App\Services\V1\Document;

use App\Models\Document;
use App\Services\V1\Document\Documentables\Documentable;
use App\Services\V1\Document\Documentables\UserDocumentableService;
use App\Services\V1\Document\Documentables\VehicleDocumentableService;
use Illuminate\Support\Collection;

class DocumentService
{
    protected $documentables = [
        'user' => UserDocumentableService::class,
        'vehicle' => VehicleDocumentableService::class
    ];

    public function getDocuments(): Collection
    {
        return Document::forUserItems()->get();
    }

    public function create(array $data): Document
    {
        /* @var $documentable Documentable */
        $documentable = resolve($this->documentables[$data['documentable_type']]);

        return $documentable->store($data);
    }

    public function update(Document $document, array $data): Document
    {
        /* @var $documentable Documentable */
        $documentable = resolve($this->documentables[$data['documentable_type']]);
        $documentable->update($document, $data);
        return $document->refresh();
    }
}
