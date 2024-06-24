<?php

use App\Models\BookingStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $bookingStatuses = [
            [
                'code' => 'requested',
                'name' => 'Requested'
            ],
            [
                'code' => 'accepted',
                'name' => 'Accepted'
            ],
            [
                'code' => 'cancelled',
                'name' => 'Cancelled'
            ],
            [
                'code' => 'declined',
                'name' => 'Declined'
            ],
            [
                'code' => 'archived',
                'name' => 'Archived'
            ]
        ];

        foreach ($bookingStatuses as $bookingStatus){
            BookingStatus::query()->createOrFirst($bookingStatus);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
