import { ChevronDown, ChevronUp, Clock, MapPin, Users } from 'lucide-react';
import React, { useState } from 'react';

interface PickAndDropStop {
    id: number;
    location: string;
    stop_time: string;
    order: number;
    notes?: string;
}

export interface PickAndDropService {
    id: number;
    user?: {
        // Made optional and flexible to handle both listing and welcome page data structures
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
    formatted_departure_time?: string;
    description?: string;
    price_per_person?: number;
    currency?: string;
    is_active?: boolean;
    is_everyday?: boolean;
    is_roundtrip?: boolean;
    return_time?: string;
    formatted_return_time?: string;
    stops?: PickAndDropStop[];
    schedule_type: 'once' | 'everyday' | 'custom' | 'weekend' | 'weekdays';
    selected_days?: string;
}

interface PickAndDropCardProps {
    service: PickAndDropService;
    onClick?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    showDetails?: boolean; // Toggle for "View Details" button presence if needed elsewhere
    className?: string;
    variant?: 'default' | 'dashboard';
    pricePlacement?: 'top-right' | 'below-route';
}

const PickAndDropCard: React.FC<PickAndDropCardProps> = ({
    service,
    onClick,
    onEdit,
    onDelete,
    className = '',
    variant = 'default',
    pricePlacement = 'top-right',
}) => {
    const [stopsExpanded, setStopsExpanded] = useState(true);

    const handleStopsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setStopsExpanded(!stopsExpanded);
    };

    const currency = service.currency || 'PKR';
    const price = service.price_per_person ? Math.round(service.price_per_person).toLocaleString() : null;
    const isDashboard = variant === 'dashboard';
    const hasVehicleInfo = Boolean(
        service.car_brand ||
            service.car_model ||
            service.car_color ||
            service.car_seats ||
            service.car_transmission ||
            service.car_fuel_type ||
            service.car?.name,
    );

    // Helper to get consistent user name
    const userName = service.name || service.user?.name || 'Driver';
    const userPhone = service.contact || service.user?.phone_number;

    return (
        <div
            onClick={onClick}
            className={`group flex cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border transition-all duration-300 ${
                isDashboard
                    ? 'border-white/70 bg-white/95 shadow-[0_20px_45px_-32px_rgba(126,36,108,0.55)] ring-1 ring-[#7e246c]/6 hover:-translate-y-0.5 hover:border-[#7e246c]/20 hover:shadow-[0_28px_60px_-34px_rgba(126,36,108,0.65)] dark:border-white/10 dark:bg-[#191520] dark:ring-white/5 dark:hover:border-white/15'
                    : 'border-gray-100 bg-white shadow-sm hover:border-[#7e246c]/30 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#7e246c]/50'
            } ${className}`}
        >
            {/* Header / Route Section */}
            <div className="p-5 pb-0">
                <div className="relative flex flex-col gap-4">
                    {/* Route Visualizer */}
                    <div className="relative z-10 flex flex-col gap-2">
                        {/* Start Location */}
                        <div className="flex items-start gap-3">
                            <div className="mt-1 flex flex-col items-center gap-1">
                                <div
                                    className={`h-3 w-3 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.15)] ring-2 ${
                                        isDashboard ? 'ring-[#fff8fe] dark:ring-[#191520]' : 'ring-white dark:ring-gray-800'
                                    }`}
                                ></div>
                                <div
                                    className={`h-10 w-0.5 bg-gradient-to-b from-green-500/50 ${isDashboard ? 'to-[#e6d5e4] dark:to-white/15' : 'to-gray-200 dark:to-gray-700'}`}
                                ></div>
                            </div>
                            <div className="flex-1">
                                <h3
                                    className={`w-60 text-base leading-tight font-bold ${isDashboard ? 'text-[#2b1128] dark:text-white' : 'text-gray-900 dark:text-white'}`}
                                >
                                    {service.start_location}
                                </h3>
                                <p
                                    className={`mt-0.5 text-xs ${isDashboard ? 'text-[#8a7286] dark:text-white/45' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    Start Point
                                </p>
                            </div>
                        </div>

                        {/* Stops Summary (if any) */}
                        {service.stops && service.stops.length > 0 && (
                            <div className="-mt-2 mb-0 flex items-start gap-3">
                                <div
                                    className={`ml-[5px] h-6 w-0.5 ${isDashboard ? 'bg-[#eadfeb] dark:bg-white/10' : 'bg-gray-200 dark:bg-gray-700'}`}
                                ></div>
                                <div className="flex-1">
                                    <button
                                        onClick={handleStopsClick}
                                        className={`flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:underline ${
                                            isDashboard
                                                ? 'bg-[#7e246c]/8 text-[#7e246c] dark:bg-white/8 dark:text-white/80'
                                                : 'bg-[#7e246c]/5 text-[#7e246c] dark:text-[#9d4edd]'
                                        }`}
                                    >
                                        {service.stops.length} Stop{service.stops.length !== 1 ? 's' : ''} in between
                                        {stopsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* End Location */}
                        <div className="-mt-1 flex items-start gap-3">
                            <div className="mt-1 flex flex-col items-center">
                                <MapPin className="h-4 w-4 fill-[#7e246c]/10 text-[#7e246c]" />
                            </div>
                            <div className="flex-1">
                                <h3
                                    className={`text-base leading-tight font-bold ${isDashboard ? 'text-[#2b1128] dark:text-white' : 'text-gray-900 dark:text-white'}`}
                                >
                                    {service.end_location}
                                </h3>
                                <p
                                    className={`mt-0.5 text-xs ${isDashboard ? 'text-[#8a7286] dark:text-white/45' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    Destination
                                </p>
                            </div>
                        </div>
                    </div>

                    {price && pricePlacement === 'top-right' && (
                        <div
                            className={`absolute top-0 right-0 hidden rounded-xl border px-3 py-1.5 md:block ${
                                isDashboard
                                    ? 'border-[#7e246c]/10 bg-[#fbf4fa] dark:border-white/10 dark:bg-white/6'
                                    : 'border-gray-100 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50'
                            }`}
                        >
                            <div
                                className={`text-xs font-medium ${isDashboard ? 'text-[#887086] dark:text-white/45' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Per Person
                            </div>
                            <div
                                className={`text-lg font-bold ${isDashboard ? 'text-[#7e246c] dark:text-white' : 'text-[#7e246c] dark:text-[#9d4edd]'}`}
                            >
                                {currency} {price}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {price && (
                <div className={`px-5 pt-4 ${pricePlacement === 'top-right' ? 'md:hidden' : ''}`}>
                    <div
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 ${
                            isDashboard
                                ? 'border-[#7e246c]/10 bg-[#fbf4fa] dark:border-white/10 dark:bg-white/6'
                                : 'border-gray-100 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50'
                        }`}
                    >
                        <span
                            className={`text-xs font-medium ${isDashboard ? 'text-[#887086] dark:text-white/45' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Per Person
                        </span>
                        <span
                            className={`text-sm font-bold ${isDashboard ? 'text-[#7e246c] dark:text-white' : 'text-[#7e246c] dark:text-[#9d4edd]'}`}
                        >
                            {currency} {price}
                        </span>
                    </div>
                </div>
            )}

            {/* Expansible Stops List */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${stopsExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div
                    className={`mx-5 mt-2 space-y-2 rounded-lg border border-dashed p-3 text-sm ${
                        isDashboard
                            ? 'border-[#e7d8e6] bg-[#fbf6fb] dark:border-white/10 dark:bg-white/4'
                            : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                    }`}
                >
                    {service.stops?.map((stop, index) => (
                        <div
                            key={stop.id || index}
                            className={`flex items-center gap-2 ${isDashboard ? 'text-[#6f556c] dark:text-white/70' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            <div
                                className={`h-1.5 w-1.5 rounded-full ${isDashboard ? 'bg-[#c8afc6] dark:bg-white/35' : 'bg-gray-300 dark:bg-gray-600'}`}
                            ></div>
                            <span className="flex-1 truncate">{stop.location}</span>
                            <span className={`text-xs whitespace-nowrap ${isDashboard ? 'text-[#a893a6] dark:text-white/35' : 'text-gray-400'}`}>
                                {stop.stop_time}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Key Info Chips */}
            <div className="flex flex-wrap gap-2 px-5 py-4">
                {/* Time */}
                <div
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
                        service.is_everyday
                            ? 'border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-800/30 dark:bg-blue-900/20 dark:text-blue-300'
                            : 'border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                >
                    <Clock className="h-3 w-3" />
                    {service.schedule_type == 'once'
                        ? 'On'
                        : service.schedule_type == 'custom'
                          ? service.selected_days
                          : service.schedule_type.toUpperCase()}{' '}
                    • {service.formatted_departure_time || service.departure_time}
                </div>

                {/* Spaces */}
                <div className="inline-flex items-center gap-1.5 rounded-md border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 dark:border-orange-800/30 dark:bg-orange-900/20 dark:text-orange-300">
                    <Users className="h-3 w-3" />
                    {service.available_spaces} Seat{service.available_spaces !== 1 ? 's' : ''} left
                </div>

                {/* Gender (if available) */}
                {service.driver_gender && (
                    <div
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
                            service.driver_gender === 'female'
                                ? 'border-pink-100 bg-pink-50 text-pink-700 dark:border-pink-800/30 dark:bg-pink-900/20 dark:text-pink-300'
                                : 'border-indigo-100 bg-indigo-50 text-indigo-700 dark:border-indigo-800/30 dark:bg-indigo-900/20 dark:text-indigo-300'
                        }`}
                    >
                        {service.driver_gender === 'female' ? '👩' : '👨'} {service.driver_gender === 'female' ? 'Female' : 'Male'} Driver
                    </div>
                )}

                {/* Round Trip */}
                {service.is_roundtrip && (
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-green-100 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:border-green-800/30 dark:bg-green-900/20 dark:text-green-300">
                        🔄 Round Trip{' '}
                        {(service.formatted_return_time || service.return_time) &&
                            `• Return: ${service.formatted_return_time || service.return_time}`}
                    </div>
                )}
            </div>

            {/* Separator */}
            <div className={`mx-5 h-px ${isDashboard ? 'bg-[#efe4ee] dark:bg-white/8' : 'bg-gray-100 dark:bg-gray-700'}`}></div>

            {/* Footer / Car Info */}
            <div className="mt-auto p-5 pt-4">
                {/* Car Info */}
                {hasVehicleInfo ? (
                    <div className="mb-4">
                        <div className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">Vehicle</div>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                            <span>🚗</span>
                            {service.car_brand ? (
                                <span>
                                    {service.car_brand} {service.car_model} <span className="font-normal text-gray-400">({service.car_color})</span>
                                </span>
                            ) : (
                                <span>{service.car?.name || 'Standard Vehicle'}</span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="mb-4 hidden md:block">
                        <div className="h-10"></div>
                    </div>
                )}

                {/* Driver & CTA */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col truncate">
                            <span
                                className={`truncate text-sm font-semibold ${isDashboard ? 'text-[#2b1128] dark:text-white' : 'text-gray-900 dark:text-white'}`}
                            >
                                {userName}
                            </span>
                            {userPhone && (
                                <span className={`truncate text-xs ${isDashboard ? 'text-[#8a7286] dark:text-white/45' : 'text-gray-500'}`}>
                                    {userPhone}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {(onEdit || onDelete) && (
                            <div className="mr-2 flex gap-1">
                                {onEdit && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit();
                                        }}
                                        className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        title="Edit"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                        </svg>
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete();
                                        }}
                                        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                                        title="Delete"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}
                        <button
                            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${
                                isDashboard
                                    ? 'bg-gradient-to-r from-[#7e246c] to-[#9d3d88] shadow-[0_16px_35px_-20px_rgba(126,36,108,0.8)] hover:from-[#6f205e] hover:to-[#8b3578]'
                                    : 'bg-[#7e246c] shadow-sm hover:bg-[#6a1f5c] dark:shadow-none'
                            }`}
                        >
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PickAndDropCard;
