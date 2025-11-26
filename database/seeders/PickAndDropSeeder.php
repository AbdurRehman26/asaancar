<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PickAndDrop;
use App\Models\PickAndDropStop;
use App\Models\User;
use App\Models\City;
use App\Models\Area;
use Carbon\Carbon;

class PickAndDropSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Only use Rahima (ID 9) and Kazmi (ID 1) users
        $users = User::whereIn('id', [1, 9])->get();
        
        if ($users->count() === 0) {
            $this->command->warn('Rahima or Kazmi users not found. Please seed users first.');
            return;
        }

        // Get Karachi city and its areas
        $karachi = City::where('name', 'Karachi')->first();
        if (!$karachi) {
            $this->command->warn('Karachi city not found. Please run CitySeeder first.');
            return;
        }

        $karachiAreas = $karachi->areas()->where('is_active', true)->get();
        if ($karachiAreas->count() < 2) {
            $this->command->warn('Not enough Karachi areas found. Please run AreaSeeder first.');
            return;
        }

        $carBrands = ['Toyota', 'Honda', 'Suzuki', 'Nissan', 'Hyundai', 'Kia', 'Daihatsu', 'Changan'];
        $carModels = ['Corolla', 'Civic', 'Mehran', 'Altis', 'City', 'Vitz', 'Cultus', 'Swift', 'Aqua'];
        $carColors = ['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red', 'Brown', 'Green'];
        $transmissions = ['manual', 'automatic'];
        $fuelTypes = ['petrol', 'diesel', 'hybrid'];
        $genders = ['male', 'female'];

        $servicesCreated = 0;
        $stopsCreated = 0;

        // Create 5 services with area-to-area routes within Karachi
        // Mix of everyday services and date-specific services
        $totalServices = 5;
        $everydayServicesCount = 0;
        
        for ($i = 0; $i < $totalServices; $i++) {
            $user = $users->random();
            
            // Randomly decide if this is an everyday service (about 35% chance)
            $isEveryday = rand(1, 100) <= 35;
            
            // Select random pickup and dropoff areas (ensure they're different)
            $pickupArea = $karachiAreas->random();
            $dropoffArea = $karachiAreas->random();
            
            // Ensure pickup and dropoff are different
            $attempts = 0;
            while ($pickupArea->id === $dropoffArea->id && $attempts < 10) {
                $dropoffArea = $karachiAreas->random();
                $attempts++;
            }

            // For everyday services, use placeholder date (2000-01-01) with random time
            // For date-specific services, use a future date
            if ($isEveryday) {
                $departureHour = rand(6, 20);
                $departureMinute = rand(0, 59);
                $departureTime = Carbon::create(2000, 1, 1, $departureHour, $departureMinute, 0);
                $everydayServicesCount++;
            } else {
                $departureTime = Carbon::now()->addDays(rand(1, 30))->addHours(rand(6, 20))->addMinutes(rand(0, 59));
            }

            $service = PickAndDrop::create([
                'user_id' => $user->id,
                'car_id' => null,
                'start_location' => $pickupArea->name,
                'end_location' => $dropoffArea->name,
                'pickup_city_id' => $karachi->id,
                'dropoff_city_id' => $karachi->id,
                'pickup_area_id' => $pickupArea->id,
                'dropoff_area_id' => $dropoffArea->id,
                'available_spaces' => rand(1, 4),
                'driver_gender' => $genders[array_rand($genders)],
                'car_brand' => $carBrands[array_rand($carBrands)],
                'car_model' => $carModels[array_rand($carModels)],
                'car_color' => $carColors[array_rand($carColors)],
                'car_seats' => rand(4, 7),
                'car_transmission' => $transmissions[array_rand($transmissions)],
                'car_fuel_type' => $fuelTypes[array_rand($fuelTypes)],
                'departure_time' => $departureTime,
                'description' => $this->getRandomDescription(),
                'price_per_person' => rand(200, 2000), // Lower price for within-city routes
                'currency' => 'PKR',
                'is_active' => true,
                'is_everyday' => $isEveryday,
            ]);

            $servicesCreated++;

            // Add multiple stops (1-4 stops) using random Karachi areas
            $numStops = rand(1, 4);
            $usedAreas = [$pickupArea->id, $dropoffArea->id]; // Track used areas to avoid duplicates
            
            $currentTime = $departureTime->copy();
            
            for ($stopIndex = 0; $stopIndex < $numStops; $stopIndex++) {
                // Get a random area that hasn't been used yet
                $availableAreas = $karachiAreas->whereNotIn('id', $usedAreas);
                
                if ($availableAreas->count() === 0) {
                    break; // No more unique areas available
                }
                
                $stopArea = $availableAreas->random();
                $usedAreas[] = $stopArea->id;
                
                // Calculate stop time (30-90 minutes between stops for within-city)
                $minutesToAdd = rand(30, 90);
                
                // For everyday services, use placeholder date with calculated time
                // For date-specific services, add minutes to the departure time
                if ($isEveryday) {
                    $stopTime = Carbon::create(2000, 1, 1, $currentTime->hour, $currentTime->minute, 0)->addMinutes($minutesToAdd);
                } else {
                    $stopTime = $currentTime->copy()->addMinutes($minutesToAdd);
                }
                
                PickAndDropStop::create([
                    'pick_and_drop_service_id' => $service->id,
                    'location' => $stopArea->name,
                    'city_id' => $karachi->id,
                    'area_id' => $stopArea->id,
                    'stop_time' => $stopTime,
                    'order' => $stopIndex + 1,
                    'notes' => $this->getRandomStopNote(),
                ]);
                
                $stopsCreated++;
                $currentTime = $stopTime;
            }
        }

        $this->command->info("Created {$servicesCreated} pick and drop services ({$everydayServicesCount} everyday, " . ($servicesCreated - $everydayServicesCount) . " date-specific) with {$stopsCreated} stops.");

    }

    /**
     * Get city coordinates
     */
    private function getCityCoordinates(string $cityName): array
    {
        $coordinates = [
            'Karachi' => ['lat' => 24.8607, 'lng' => 67.0011],
            'Lahore' => ['lat' => 31.5204, 'lng' => 74.3587],
            'Islamabad' => ['lat' => 33.6844, 'lng' => 73.0479],
            'Rawalpindi' => ['lat' => 33.5651, 'lng' => 73.0169],
            'Faisalabad' => ['lat' => 31.4504, 'lng' => 73.1350],
            'Multan' => ['lat' => 30.1968, 'lng' => 71.4782],
            'Peshawar' => ['lat' => 34.0080, 'lng' => 71.5785],
            'Quetta' => ['lat' => 30.1841, 'lng' => 67.0014],
            'Hyderabad' => ['lat' => 25.3924, 'lng' => 68.3737],
            'Gujranwala' => ['lat' => 32.1557, 'lng' => 74.1871],
            'Sialkot' => ['lat' => 32.4927, 'lng' => 74.5313],
            'Sukkur' => ['lat' => 27.7032, 'lng' => 68.8589],
            'Bahawalpur' => ['lat' => 29.3978, 'lng' => 71.6752],
            'Sargodha' => ['lat' => 32.0859, 'lng' => 72.6742],
            'Jhang' => ['lat' => 31.3057, 'lng' => 72.3259],
            'Sheikhupura' => ['lat' => 31.7129, 'lng' => 73.9856],
        ];

        return $coordinates[$cityName] ?? ['lat' => 31.5204, 'lng' => 74.3587]; // Default to Lahore
    }

    /**
     * Get random description
     */
    private function getRandomDescription(): string
    {
        $descriptions = [
            'Comfortable ride with AC. Safe and reliable driver. Contact for more details.',
            'Spacious car with excellent condition. Professional driver with years of experience.',
            'Clean and well-maintained vehicle. Punctual and courteous service.',
            'Luxury ride with all modern amenities. Experienced driver available.',
            'Economical and comfortable journey. Safe driving guaranteed.',
            'Premium service with AC and music. Professional and friendly driver.',
            'Reliable transportation with comfortable seating. Contact for booking.',
            'Well-maintained car with experienced driver. Safe and timely journey.',
        ];

        return $descriptions[array_rand($descriptions)];
    }

    /**
     * Get random stop note
     */
    private function getRandomStopNote(): ?string
    {
        $notes = [
            'Quick stop for refreshments',
            'Rest stop for 15-20 minutes',
            'Pickup/dropoff point',
            'Break for food and rest',
            null,
            null, // More nulls to have some stops without notes
        ];

        return $notes[array_rand($notes)];
    }
}
