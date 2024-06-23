<?php

namespace App\Services\V1\Document\Documentables;

use App\Models\Document;

interface Documentable
{
    public function store(array $data): Document;

    public function update(Document $document, array $data): Document;

    public function delete();
}
