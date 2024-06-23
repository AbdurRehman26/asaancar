<?php

namespace App\Services\V1\Document\Documentables;

use App\Models\Document;

class UserDocumentableService implements Documentable
{
    public function store(array $data): Document
    {
        $data['documentable_type'] = Document::DOCUMENTABLE_TYPES[$data['documentable_type']];
        return Document::create($data);
    }

    public function update(Document $document, array $data): Document
    {
        $data['documentable_type'] = Document::DOCUMENTABLE_TYPES[$data['documentable_type']];
        $document->update($data);
        return $document->refresh();
    }

    public function delete()
    {
        // TODO: Implement delete() method.
    }
}
