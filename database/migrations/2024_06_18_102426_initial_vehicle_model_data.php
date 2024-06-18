<?php

use App\Models\VehicleMake;
use App\Models\VehicleModel;
use App\Models\VehicleType;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $vehicleModelsData = [42 => ['Corolla', 'C-HR', 'Yaris', 'Fortuner', 'Land Cruiser', '86', 'Alphard', 'Aqua', 'Auris', 'Camry', 'Coaster', 'Crown', 'Harrier', 'Hilux', 'Kluger', 'Noah', 'Pixis Epoch', 'Prado', 'Prius', 'Rav4', 'Rush', 'Supra', 'Town Ace', 'Urban Cruiser', 'Voxy', 'Hiace', 'Dyna', 'Vios', 'Corolla Hatchback', 'Century', 'Highlander', 'Corolla Cross', 'Esquire', 'Innova', 'Passo', 'Raize', 'Roomy', 'Vellfire', 'Yaris Cross', 'Yaris Hatchback', ], 41 => ['Alto', 'Cultus', 'Swift', 'Wagon R', 'Bolan', 'Ignis', 'Jimny', 'Landy', 'Solio', 'Spacia', 'XL7', 'Xbee', 'S Cross', 'Ertiga', 'Every', 'Ravi', ], 14 => ['Civic', 'BR-V', 'City', 'Accord', 'HR-V', 'Vezel', 'CR-V', 'Fit', 'Freed', 'Insight', 'Inspire', 'Jazz', 'Mobilio', 'N Box', 'N One', 'N Wgn', 'Odyssey', 'Passport', 'S660', 'Spike', 'Brio', 'Elysion', 'N-Van', ], 8 => ['Mira', 'Taft', 'Bezza', 'Boon', 'Cast', 'Copen', 'Gran Max', 'Hijet', 'Move', 'Move Canbus', 'Rocky', 'Tanto', 'Terios', 'Wake', 'Xenia', 'Thor', ], 53 => ['e-tron', 'A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'e-tron GT', 'Q2', 'Q3', 'Q5', 'Q7', 'R8', 'TT', 'Q8', 'S5', ], 120 => ['BJ40', 'BJ40 Plus', 'Senova X25', 'Senova D20', ], 88 => ['Flying Spur', 'Continental Gt', ], 3 => ['3 Series', 'iX', 'X7', '1 Series', '6 Series', '8 Series', 'i4', 'i8', 'iX3', 'X1', 'X2', 'X3 Series', 'X5 Series', 'X6 Series', 'Z4', '2 Series', '5 Series', '7 Series', 'X4', 'i5', ], 123 => ['Chiron', 'Veyron', ], 54 => ['Envision', 'Enclave', ], 68 => ['Alsvin', 'Karvaan', 'UNI-T', 'Oshan X7', 'CS35 Plus', 'Kalash', 'A800', 'CX70T', 'M9', ], 69 => ['Tiggo 4 Pro', 'Tiggo 8 Pro', ], 5 => ['Tahoe', 'Camaro', 'Corvette', 'Malibu', 'Onix', 'Silverado', 'Spark', 'Suburban', 'Traverse', ], 56 => ['300 C', ], 111 => ['Shehzore', ], 57 => ['1200', ], 134 => ['L07', 'S07', ], 102 => ['Glory 580', 'C37', 'Glory 500', ], 52 => ['Challenger', 'Charger', 'Ram', ], 93 => ['X-PV', 'Senya R7 ', ], 58 => ['Bronco', 'Fiesta', 'Mustang', 'Mustang Mach-E', 'Ranger', 'Transit', ], 122 => ['GS3', ], 129 => ['GV60', ], 13 => ['Sierra', ], 126 => ['250', 'GIGI', ], 121 => ['Jolion', 'H6', ], 135 => ['Ve', ], 16 => ['Tucson', 'Ioniq 5', 'Elantra', 'Ioniq 6', 'Sonata', 'Staria', 'H-100', 'i10', 'Mighty', 'Santa Fe', ], 18 => ['D-Max', ], 108 => ['T6', 'X200', ], 19 => ['XF', ], 20 => ['Cherokee', 'Gladiator ', 'Wrangler', ], 114 => ['Vigus', ], 112 => ['Bravo', 'Safari ', ], 21 => ['Sportage', 'Picanto', 'Grand Carnival', 'Sorento', 'Cerato', 'Rio', 'Stonic', 'Frontier K2700', 'K5', 'Niro', 'Shehzore K2700', 'Stinger', ], 87 => ['Aventador', 'Huracan', ], 23 => ['Discovery', ], 24 => ['LX Series', 'Nx', 'UX ', ], 104 => ['Levante', 'Ghibli', 'MC20', 'Quattroporte', ], 26 => ['Axela', 'Bt 50', 'Carol', 'Cx5', 'Flair', 'MX 5', 'Titan', 'Flair Crossover', ], 27 => ['S Class', 'E Class', 'GLB Class', 'A Class', 'B Class', 'C Class', 'EQC', 'EQS', 'G Class', 'M Class', 'Sprinter', 'Vito', 'GLA Class', 'CLA Class', 'EQE', 'GLS Class', ], 60 => ['ZS EV', '3', '5', '5 EV', '6', 'HS', 'RX8', 'EP', 'Gloster', '4', 'Extender', 'MARVEL R', ], 29 => ['EK X', 'L200', 'Mirage', 'Outlander', 'Rvr', 'Triton', ], 118 => ['KY10', ], 30 => ['Almera', 'Cima', 'Clipper', 'Dayz', 'Elgrand', 'Fuga', 'GT-R', 'Juke', 'Kicks', 'Kix', 'Leaf', 'Maxima', 'Micra', 'Murano', 'Navara', 'Note', 'Patrol', 'Pulsar', 'Qashqai', 'Safari', 'Sentra', 'Serena', 'Skyline', 'X Trail', ], 31 => ['Corsa', ], 131 => ['03', ], 32 => ['2008', '508', 'E-2008', ], 70 => ['911', 'Boxster', 'Cayenne', 'Cayman', 'Macan', 'Panamera', 'Taycan', ], 128 => ['Mini Bus', ], 115 => ['Pearl', 'K01', 'K07', ], 80 => ['Saga', 'X70', 'X50' ], 49 => ['Sport', 'Velar', ], 98 => ['Cullinan', 'Ghost', 'Phantom', 'Spectre', 'Wraith', 'Dawn', ], 130 => ['3', ], 39 => ['Octavia', 'Superb', ], 71 => ['Korando', 'Rexton', ], 40 => ['Brz', 'Forester', 'Impreza', 'Impreza Sports', 'Legacy B4', 'Levorg', 'Sambar ', 'Stella', 'Xv', ], 132 => ['500', ], 110 => ['Model S', 'Model X', 'Model 3', 'Model Y', ], 113 => ['Bravo', 'Alpha' ], 43 => ['Golf', 'Passat', 'Polo', 'Touareg', 'Transporter T6', ], 51 => ['S90', 'XC60', 'XC90' ], 119 => ['Z100' ]];
        $vehicleType = VehicleType::first();

        foreach ($vehicleModelsData as $vehicleMakeCode => $vehicleModels){
            $vehicleMake = VehicleMake::where('code', $vehicleMakeCode)->first();

            foreach ($vehicleModels as $vehicleModel){
                VehicleModel::query()->createOrFirst([
                    'vehicle_make_id' => $vehicleMake->id,
                    'vehicle_type_id' => $vehicleType->id,
                    'name' => $vehicleModel
                ]);
            }

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
