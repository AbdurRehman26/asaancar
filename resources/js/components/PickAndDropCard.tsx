import React, { useState } from 'react';
import { MapPin, Users, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface PickAndDropStop {
    id: number;
    location: string;
    stop_time: string;
    order: number;
    notes?: string;
}

export interface PickAndDropService {
    id: number;
    user?: { // Made optional and flexible to handle both listing and welcome page data structures
        id: number;
        name: string;
        email?: string;
        phone_number?: string;
    };
    name?: string; // listing page sometimes has name directly on service
    contact?: string;
    car?: {
        id: number;
        name: string;
    };
    start_location: string;
    end_location: string;
    available_spaces: number;
    driver_gender?: 'male' | 'female'; // Optional as welcome page might not have it
    car_brand?: string;
    car_model?: string;
    car_color?: string;
    car_seats?: number;
    car_transmission?: string;
    car_fuel_type?: string;
    departure_time: string;
    description?: string;
    price_per_person?: number;
    currency?: string;
    is_active?: boolean;
    is_everyday?: boolean;
    stops?: PickAndDropStop[];
    schedule_type: 'once' | 'everyday' | 'custom' | 'weekend' | 'weekdays';
    selected_days?: string;
}

interface PickAndDropCardProps {
    service: PickAndDropService;
    onClick?: () => void;
    showDetails?: boolean; // Toggle for "View Details" button presence if needed elsewhere
    className?: string;
}

const PickAndDropCard: React.FC<PickAndDropCardProps> = ({ service, onClick, className = '' }) => {
    const [stopsExpanded, setStopsExpanded] = useState(false);

    const handleStopsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setStopsExpanded(!stopsExpanded);
    };

    const currency = service.currency || 'PKR';
    const price = service.price_per_person ? Math.round(service.price_per_person).toLocaleString() : null;

    // Helper to get consistent user name
    const userName = service.name || service.user?.name || 'Driver';
    const userPhone = service.contact || service.user?.phone_number;

    return (
        <div
            onClick={onClick}
            className={`group flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-[#7e246c]/30 dark:hover:border-[#7e246c]/50 transition-all duration-300 overflow-hidden cursor-pointer ${className}`}
        >
            {/* Header / Route Section */}
            <div className="p-5 pb-0">
                <div className="flex flex-col gap-4 relative">
                    {/* Route Visualizer */}
                    <div className="flex flex-col gap-2 relative z-10">
                        {/* Start Location */}
                        <div className="flex items-start gap-3">
                            <div className="mt-1 flex flex-col items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.15)] ring-2 ring-white dark:ring-gray-800"></div>
                                <div className="w-0.5 h-10 bg-gradient-to-b from-green-500/50 to-gray-200 dark:to-gray-700"></div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold w-60 text-gray-900 dark:text-white leading-tight">
                                    {service.start_location}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Start Point</p>
                            </div>
                        </div>

                        {/* Stops Summary (if any) */}
                        {service.stops && service.stops.length > 0 && (
                            <div className="flex items-start gap-3 -mt-2 mb-0">
                                <div className="ml-[5px] w-0.5 h-6 bg-gray-200 dark:bg-gray-700"></div>
                                <div className="flex-1">
                                    <button
                                        onClick={handleStopsClick}
                                        className="text-xs font-medium text-[#7e246c] flex items-center gap-1 hover:underline bg-[#7e246c]/5 px-2 py-1 rounded-md w-fit transition-colors"
                                    >
                                        {service.stops.length} Stop{service.stops.length !== 1 ? 's' : ''} in between
                                        {stopsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* End Location */}
                        <div className="flex items-start gap-3 -mt-1">
                            <div className="mt-1 flex flex-col items-center">
                                <MapPin className="w-4 h-4 text-[#7e246c] fill-[#7e246c]/10" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                                    {service.end_location}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Destination</p>
                            </div>
                        </div>
                    </div>

                    {/* Price Tag (Top Right) */}
                    {price && (
                        <div className="absolute top-0 right-0 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-600">
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Per Person</div>
                            <div className="text-lg font-bold text-[#7e246c] dark:text-[#9d4edd]">
                                {currency} {price}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Expansible Stops List */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${stopsExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="mx-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-sm space-y-2 mt-2 border border-dashed border-gray-200 dark:border-gray-700">
                    {service.stops?.map((stop, index) => (
                        <div key={stop.id || index} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                            <span className="flex-1 truncate">{stop.location}</span>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{stop.stop_time}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Key Info Chips */}
            <div className="px-5 py-4 flex flex-wrap gap-2">
                {/* Time */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${service.is_everyday
                        ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30'
                        : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                    }`}>
                    <Clock className="w-3 h-3" />
                    {service.schedule_type == 'once' ? 'On' : service.schedule_type == 'custom' ? service.selected_days : service.schedule_type.toUpperCase()} • {service.departure_time}
                </div>

                {/* Spaces */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/30">
                    <Users className="w-3 h-3" />
                    {service.available_spaces} Seat{service.available_spaces !== 1 ? 's' : ''} left
                </div>

                {/* Gender (if available) */}
                {service.driver_gender && (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${service.driver_gender === 'female'
                            ? 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800/30'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800/30'
                        }`}>
                        {service.driver_gender === 'female' ? '👩' : '👨'} {service.driver_gender === 'female' ? 'Female' : 'Male'} Driver
                    </div>
                )}
            </div>

            {/* Separator */}
            <div className="h-px bg-gray-100 dark:bg-gray-700 mx-5"></div>

            {/* Footer / Car Info */}
            <div className="p-5 pt-4 mt-auto">
                {/* Car Info */}
                {(service.car_brand || (service.car && service.car.name)) ? (
                    <div className="mb-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Vehicle</div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <span>🚗</span>
                            {service.car_brand ? (
                                <span>{service.car_brand} {service.car_model} <span className="text-gray-400 font-normal">({service.car_color})</span></span>
                            ) : (
                                <span>{service.car?.name || 'Standard Vehicle'}</span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="mb-4">
                        {/* Placeholder height if no car info to keep card size consistent-ish, or remove if not desired */}
                        <div className="h-10"></div>
                    </div>
                )}

                {/* Driver & CTA */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col truncate">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</span>
                            {userPhone && <span className="text-xs text-gray-500 truncate">{userPhone}</span>}
                        </div>
                    </div>

                    <button
                        className="shrink-0 px-4 py-2 bg-[#7e246c] hover:bg-[#6a1f5c] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm dark:shadow-none"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PickAndDropCard;
