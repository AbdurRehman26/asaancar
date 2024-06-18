<?php

use App\Models\VehicleMake;
use App\Models\VehicleType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $carMakes = [
            42 => 'toyota',
            41 => 'suzuki',
            14 => 'honda',
            8 => 'daihatsu',
            66 => 'adam',
            50 => 'alfa-romeo',
            53 => 'audi',
            103 => 'austin',
            120 => 'baic',
            88 => 'bentley',
            3 => 'bmw',
            123 => 'bugatti',
            54 => 'buick',
            4 => 'cadillac',
            68 => 'changan',
            69 => 'chery',
            5 => 'chevrolet',
            56 => 'chrysler',
            55 => 'citroen',
            45 => 'classic-cars',
            111 => 'daehan',
            7 => 'daewoo',
            96 => 'daimler',
            57 => 'datsun',
            134 => 'deepal',
            102 => 'dfsk',
            52 => 'dodge',
            109 => 'dongfeng',
            93 => 'faw',
            75 => 'ferrari',
            11 => 'fiat',
            58 => 'ford',
            122 => 'gac',
            77 => 'geely',
            129 => 'genesis',
            13 => 'gmc',
            101 => 'golden-dragon',
            100 => 'golf',
            126 => 'gugo',
            121 => 'haval',
            99 => 'hillman',
            72 => 'hino',
            135 => 'honri',
            78 => 'hummer',
            16 => 'hyundai',
            18 => 'isuzu',
            108 => 'jac',
            19 => 'jaguar',
            127 => 'jaxeri',
            20 => 'jeep',
            117 => 'jinbei',
            114 => 'jmc',
            112 => 'jw-forland',
            106 => 'kaiser',
            21 => 'kia',
            107 => 'lada',
            87 => 'lamborghini',
            23 => 'land-rover',
            24 => 'lexus',
            124 => 'lifan',
            59 => 'lincoln',
            104 => 'maserati',
            92 => 'master',
            26 => 'mazda',
            116 => 'mclaren',
            27 => 'mercedes-benz',
            60 => 'mg',
            28 => 'mini',
            29 => 'mitsubishi',
            89 => 'morris',
            85 => 'moto-guzzi',
            118 => 'mushtaq',
            30 => 'nissan',
            61 => 'oldsmobile',
            31 => 'opel',
            131 => 'ora',
            46 => 'others',
            32 => 'peugeot',
            62 => 'plymouth',
            133 => 'polaris',
            33 => 'pontiac',
            70 => 'porsche',
            128 => 'power',
            115 => 'prince',
            80 => 'proton',
            49 => 'range-rover',
            35 => 'renault',
            125 => 'rinco',
            98 => 'rolls-royce',
            65 => 'roma',
            67 => 'rover',
            86 => 'royal-enfield',
            64 => 'saab',
            74 => 'scion',
            130 => 'seres',
            39 => 'skoda',
            79 => 'smart',
            90 => 'sogo',
            94 => 'sokon',
            71 => 'ssangyong',
            40 => 'subaru',
            132 => 'tank',
            110 => 'tesla',
            95 => 'triumph',
            113 => 'united',
            73 => 'vauxhall',
            43 => 'volkswagen',
            51 => 'volvo',
            105 => 'willys',
            119 => 'zotye',
        ];

        $vehicleTypeId = VehicleType::first()->id;

        foreach ($carMakes as $key => $carMake){
            VehicleMake::query()->createOrFirst([
                'code' => $key,
                'slug' => $carMake,
                'name' => Str::of($carMake)->replace('-', ' ')->title(),
                'vehicle_type_id' => $vehicleTypeId
            ]);
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
