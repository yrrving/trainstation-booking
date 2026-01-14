import { useState, useEffect } from 'react';
import type { BookingOption } from '../../types';
import { BookingMode } from '../../types';
import { bookingOptionsAPI } from '../../api/client';

interface OptionSelectorProps {
  locationId: string;
  mode: BookingMode;
  onSelectOption: (option: BookingOption) => void;
}

export default function OptionSelector({ locationId, mode, onSelectOption }: OptionSelectorProps) {
  const [options, setOptions] = useState<BookingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOptions();
  }, [locationId, mode]);

  async function loadOptions() {
    try {
      const response: any = await bookingOptionsAPI.getAll({
        location_id: locationId,
        mode,
        is_active: true,
      });
      setOptions(response.options);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Laddar alternativ...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">Fel: {error}</div>;
  }

  if (options.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        Inga bokningsalternativ tillgängliga för detta bokningssätt.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Välj vad du vill boka</h2>
      <div className="grid grid-cols-1 gap-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelectOption(option)}
            className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition text-left"
          >
            <h3 className="font-semibold text-lg">{option.label}</h3>
            <p className="text-gray-600 mt-2">{option.description}</p>
            <div className="mt-3 flex gap-4 text-sm text-gray-500">
              <span>⏱️ {option.duration_minutes} min</span>
              <span>👥 Max {option.capacity.max_people} personer</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
