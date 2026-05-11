import { useAuth } from '@/components/AuthContext';
import Navbar from '@/components/navbar';
import { apiFetch } from '@/lib/utils';
import { UserVehicle } from '@/types';
import { Bike, Car, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type VehicleType = 'car' | 'bike';

const vehicleTypeOptions: Array<{
    value: VehicleType;
    title: string;
    description: string;
    icon: typeof Car;
}> = [
    {
        value: 'car',
        title: 'Car',
        description: 'Best if you usually drive riders in a car and want to show seats and fuel details.',
        icon: Car,
    },
    {
        value: 'bike',
        title: 'Bike',
        description: 'Great for bike-based commuting so riders know the vehicle type before they contact you.',
        icon: Bike,
    },
];

export default function DriverOnboardingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        vehicle_type: 'car' as VehicleType,
        brand: '',
        model: '',
        color: '',
        seats: '',
        transmission: '',
        fuel_type: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedVehicle, setSavedVehicle] = useState<UserVehicle | null>(null);

    const vehicleLabel = useMemo(() => {
        if (!savedVehicle) {
            return '';
        }

        return [savedVehicle.brand, savedVehicle.model].filter(Boolean).join(' ').trim() || (savedVehicle.vehicle_type === 'bike' ? 'Bike' : 'Car');
    }, [savedVehicle]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch('/api/user/vehicles', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    seats: formData.seats ? parseInt(formData.seats, 10) : null,
                    transmission: formData.transmission || null,
                    fuel_type: formData.fuel_type || null,
                    is_default: true,
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Unable to save your vehicle right now.');
            }

            setSavedVehicle(responseData.data);
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Unable to save your vehicle right now.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.12),_transparent_30%),linear-gradient(180deg,_#f8f2fa_0%,_#f3f0f9_52%,_#eef1f8_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(216,138,200,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(126,36,108,0.16),_transparent_24%),linear-gradient(180deg,_#130f18_0%,_#18141e_50%,_#11131b_100%)]">
            <Navbar />

            <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-24 md:flex-row md:items-start">
                <div className="w-full rounded-[1.75rem] border border-white/70 bg-white/90 p-8 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur md:w-[1.2fr] dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#7e246c]/15 bg-[#fbf4fa] px-4 py-2 text-sm font-medium text-[#7e246c] dark:border-white/10 dark:bg-white/6 dark:text-white/80">
                        <Sparkles className="h-4 w-4" />
                        Driver setup
                    </div>

                    <h1 className="mt-5 text-3xl font-bold text-[#2b1128] dark:text-white">Add your vehicle details</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f556c] dark:text-white/65">
                        {user?.name ? `${user.name}, let's` : "Let's"} set up the vehicle you drive so your first ride listing feels faster to
                        publish.
                    </p>

                    {savedVehicle ? (
                        <div className="mt-8 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600 dark:text-emerald-300" />
                                <div className="space-y-3">
                                    <div>
                                        <h2 className="text-xl font-semibold text-[#15321f] dark:text-white">Vehicle saved</h2>
                                        <p className="mt-1 text-sm text-[#34614a] dark:text-white/65">
                                            Your {savedVehicle.vehicle_type} {vehicleLabel ? `(${vehicleLabel}) ` : ''}is ready to be reused when you
                                            create a ride.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/dashboard/pick-and-drop/create')}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7e246c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6a1f5c]"
                                        >
                                            Add my first route
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/dashboard')}
                                            className="inline-flex items-center justify-center rounded-xl border border-[#7e246c]/20 px-5 py-3 text-sm font-semibold text-[#7e246c] transition hover:bg-[#fbf4fa] dark:border-white/10 dark:text-white dark:hover:bg-white/6"
                                        >
                                            Maybe later
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="mb-3 block text-sm font-medium text-[#4b3748] dark:text-white/80">What do you drive?</label>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {vehicleTypeOptions.map((option) => {
                                        const Icon = option.icon;
                                        const isActive = formData.vehicle_type === option.value;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setFormData((current) => ({ ...current, vehicle_type: option.value }))}
                                                className={`rounded-[1.25rem] border p-4 text-left transition ${
                                                    isActive
                                                        ? 'border-[#7e246c] bg-[#fbf4fa] shadow-sm dark:border-[#d88ac8] dark:bg-white/8'
                                                        : 'border-[#7e246c]/12 bg-white hover:bg-[#fbf4fa] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/6'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`rounded-xl p-3 ${
                                                            isActive
                                                                ? 'bg-[#7e246c] text-white'
                                                                : 'bg-[#fbf4fa] text-[#7e246c] dark:bg-white/8 dark:text-white/80'
                                                        }`}
                                                    >
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-[#2b1128] dark:text-white">{option.title}</div>
                                                        <div className="mt-1 text-sm text-[#6f556c] dark:text-white/60">{option.description}</div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-[#4b3748] dark:text-white/80">Brand</label>
                                    <input
                                        type="text"
                                        value={formData.brand}
                                        onChange={(event) => setFormData((current) => ({ ...current, brand: event.target.value }))}
                                        placeholder={formData.vehicle_type === 'bike' ? 'e.g. Honda' : 'e.g. Toyota'}
                                        className="w-full rounded-lg border border-[#7e246c]/20 bg-[#fbf4fa] px-4 py-3 text-base text-[#2b1128] focus:border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] dark:border-white/10 dark:bg-white/6 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-[#4b3748] dark:text-white/80">Model</label>
                                    <input
                                        type="text"
                                        value={formData.model}
                                        onChange={(event) => setFormData((current) => ({ ...current, model: event.target.value }))}
                                        placeholder={formData.vehicle_type === 'bike' ? 'e.g. CB 125' : 'e.g. Corolla'}
                                        className="w-full rounded-lg border border-[#7e246c]/20 bg-[#fbf4fa] px-4 py-3 text-base text-[#2b1128] focus:border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] dark:border-white/10 dark:bg-white/6 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-[#4b3748] dark:text-white/80">Color</label>
                                    <input
                                        type="text"
                                        value={formData.color}
                                        onChange={(event) => setFormData((current) => ({ ...current, color: event.target.value }))}
                                        placeholder="e.g. White"
                                        className="w-full rounded-lg border border-[#7e246c]/20 bg-[#fbf4fa] px-4 py-3 text-base text-[#2b1128] focus:border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] dark:border-white/10 dark:bg-white/6 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-[#4b3748] dark:text-white/80">Seats</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="12"
                                        value={formData.seats}
                                        onChange={(event) => setFormData((current) => ({ ...current, seats: event.target.value }))}
                                        placeholder={formData.vehicle_type === 'bike' ? 'e.g. 2' : 'e.g. 4'}
                                        className="w-full rounded-lg border border-[#7e246c]/20 bg-[#fbf4fa] px-4 py-3 text-base text-[#2b1128] focus:border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] dark:border-white/10 dark:bg-white/6 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-[#4b3748] dark:text-white/80">Transmission</label>
                                    <select
                                        value={formData.transmission}
                                        onChange={(event) => setFormData((current) => ({ ...current, transmission: event.target.value }))}
                                        className="w-full rounded-lg border border-[#7e246c]/20 bg-[#fbf4fa] px-4 py-3 text-base text-[#2b1128] focus:border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] dark:border-white/10 dark:bg-white/6 dark:text-white"
                                    >
                                        <option value="">Select transmission</option>
                                        <option value="manual">Manual</option>
                                        <option value="automatic">Automatic</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-[#4b3748] dark:text-white/80">Fuel type</label>
                                    <select
                                        value={formData.fuel_type}
                                        onChange={(event) => setFormData((current) => ({ ...current, fuel_type: event.target.value }))}
                                        className="w-full rounded-lg border border-[#7e246c]/20 bg-[#fbf4fa] px-4 py-3 text-base text-[#2b1128] focus:border-[#7e246c] focus:ring-2 focus:ring-[#7e246c] dark:border-white/10 dark:bg-white/6 dark:text-white"
                                    >
                                        <option value="">Select fuel type</option>
                                        <option value="petrol">Petrol</option>
                                        <option value="diesel">Diesel</option>
                                        <option value="electric">Electric</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center justify-center rounded-xl bg-[#7e246c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6a1f5c] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {loading ? 'Saving vehicle...' : 'Save vehicle'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/pick-and-drop')}
                                    className="inline-flex items-center justify-center rounded-xl border border-[#7e246c]/20 px-5 py-3 text-sm font-semibold text-[#7e246c] transition hover:bg-[#fbf4fa] dark:border-white/10 dark:text-white dark:hover:bg-white/6"
                                >
                                    Skip and explore rides
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="w-full rounded-[1.75rem] border border-white/70 bg-white/90 p-8 shadow-[0_18px_45px_-32px_rgba(126,36,108,0.35)] backdrop-blur md:w-[0.8fr] dark:border-white/10 dark:bg-[#17141f]/92 dark:shadow-none">
                    <h2 className="text-2xl font-bold text-[#2b1128] dark:text-white">What happens next?</h2>
                    <div className="mt-6 space-y-4">
                        {[
                            'Save the car or bike you usually drive.',
                            'Reuse that vehicle when you create your first ride.',
                            'Still keep the option to adjust those details manually per route.',
                        ].map((item) => (
                            <div
                                key={item}
                                className="flex items-start gap-3 rounded-2xl border border-[#7e246c]/10 bg-[#fbf4fa] p-4 dark:border-white/10 dark:bg-white/6"
                            >
                                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#7e246c]" />
                                <p className="text-sm leading-6 text-[#5d4658] dark:text-white/65">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
