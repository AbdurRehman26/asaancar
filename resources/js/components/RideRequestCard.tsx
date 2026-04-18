import { ArrowRight, Clock, MapPin, User, Users } from 'lucide-react';
import React from 'react';

export interface RideRequest {
    id: number;
    user?: {
        id: number;
        name: string;
        email?: string;
        phone_number?: string;
    };
    name?: string;
    contact?: string;
    start_location: string;
    end_location: string;
    departure_time: string;
    formatted_departure_time?: string;
    schedule_type: 'once' | 'everyday' | 'weekdays' | 'weekends' | 'custom';
    selected_days?: string[];
    selected_days_label?: string | null;
    preferred_driver_gender: 'male' | 'female' | 'any';
    required_seats: number;
    budget_per_seat?: number | null;
    currency?: string;
    is_roundtrip?: boolean;
    formatted_return_time?: string | null;
    description?: string;
}

interface RideRequestCardProps {
    request: RideRequest;
    onClick?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    className?: string;
    showRequesterInfo?: boolean;
}

const RideRequestCard: React.FC<RideRequestCardProps> = ({ request, onClick, onEdit, onDelete, className = '', showRequesterInfo = true }) => {
    const requesterName = request.name || request.user?.name || 'Requester';
    const requesterPhone = request.contact || request.user?.phone_number;

    return (
        <div
            onClick={onClick}
            className={`cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-[#7e246c]/30 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#7e246c]/50 ${className}`}
        >
            <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#7e246c] uppercase dark:text-[#c66ab3]">
                            <MapPin className="h-3.5 w-3.5" />
                            Ride Request
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{request.start_location}</h3>
                            <div className="flex items-center gap-2 text-gray-400">
                                <ArrowRight className="h-4 w-4" />
                            </div>
                            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">{request.end_location}</h4>
                        </div>
                    </div>

                    {request.budget_per_seat ? (
                        <div className="rounded-xl border border-[#7e246c]/10 bg-[#7e246c]/5 px-3 py-2 text-right dark:border-[#7e246c]/25 dark:bg-[#7e246c]/10">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Budget / seat</div>
                            <div className="text-base font-bold text-[#7e246c] dark:text-[#d685c3]">
                                {request.currency || 'PKR'} {Math.round(request.budget_per_seat).toLocaleString()}
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                        <Clock className="h-3 w-3" />
                        {request.schedule_type === 'custom'
                            ? request.selected_days_label || request.selected_days?.join(', ')
                            : request.schedule_type}{' '}
                        • {request.formatted_departure_time || request.departure_time}
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 dark:border-orange-800/30 dark:bg-orange-900/20 dark:text-orange-300">
                        <Users className="h-3 w-3" />
                        {request.required_seats} seat{request.required_seats !== 1 ? 's' : ''} needed
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-800/30 dark:bg-blue-900/20 dark:text-blue-300">
                        <User className="h-3 w-3" />
                        {request.preferred_driver_gender === 'any'
                            ? 'Any driver'
                            : `${request.preferred_driver_gender === 'female' ? 'Female' : 'Male'} driver`}
                    </div>
                </div>

                {request.description ? <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{request.description}</p> : null}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-gray-700">
                <div className="min-w-0">
                    {showRequesterInfo ? (
                        <>
                            <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">{requesterName}</div>
                            {requesterPhone ? <div className="truncate text-xs text-gray-500 dark:text-gray-400">{requesterPhone}</div> : null}
                        </>
                    ) : (
                        <>
                            <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">Requester info hidden</div>
                            <div className="truncate text-xs text-gray-500 dark:text-gray-400">Login to view requester details</div>
                        </>
                    )}
                </div>

                {(onEdit || onDelete) && (
                    <div className="flex items-center gap-2">
                        {onEdit ? (
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onEdit();
                                }}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                                Edit
                            </button>
                        ) : null}
                        {onDelete ? (
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onDelete();
                                }}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                Delete
                            </button>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RideRequestCard;
