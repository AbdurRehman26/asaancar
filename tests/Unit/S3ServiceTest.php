<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\S3Service;

class S3ServiceTest extends TestCase
{
    protected S3Service $s3Service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->s3Service = new S3Service();
    }

    public function test_s3_service_can_be_instantiated()
    {
        $this->assertInstanceOf(S3Service::class, $this->s3Service);
    }

    public function test_upload_file_returns_null_when_no_file_provided()
    {
        $result = $this->s3Service->uploadFile(null, 'test-directory');
        $this->assertNull($result);
    }

    public function test_upload_multiple_files_returns_empty_array_when_no_files_provided()
    {
        $result = $this->s3Service->uploadMultipleFiles([], 'test-directory');
        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    public function test_delete_multiple_files_returns_true_for_empty_array()
    {
        $result = $this->s3Service->deleteMultipleFiles([]);
        $this->assertTrue($result);
    }
}
