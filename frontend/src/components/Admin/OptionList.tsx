import { useState, useEffect } from 'react';
import type { BookingOption } from '../../types';
import { BookingMode } from '../../types';
import { bookingOptionsAPI } from '../../api/client';

interface OptionListProps {
  locationId: string;
  mode: BookingMode;
  onEdit: (option: BookingOption) => void;
  onRefresh?: () => void;
}

export default function OptionList({ locationId, mode, onEdit, onRefresh }: OptionListProps) {
  const [options, setOptions] = useState<BookingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOptions();
  }, [locationId, mode]);

  async function loadOptions() {
    setLoading(true);
    try {
      const response: any = await bookingOptionsAPI.getAll({
        location_id: locationId,
        mode,
      });
      setOptions(response.options);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(optionId: string) {
    if (!confirm('Är du säker på att du vill ta bort detta bokningsalternativ?')) {
      return;
    }

    try {
      await bookingOptionsAPI.delete(optionId);
      loadOptions();
      onRefresh?.();
    } catch (err: any) {
      alert('Fel vid borttagning: ' + err.message);
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500 py-4">Laddar alternativ...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600 py-4">Fel: {error}</div>;
  }

  if (options.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 bg-gray-50 rounded-lg border">
        Inga bokningsalternativ har skapats ännu.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <div key={option.id} className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold">{option.label}</h4>
              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>⏱️ {option.duration_minutes} min</span>
                <span>👥 Max {option.capacity.max_people}</span>
                <span className={option.is_active ? 'text-green-600' : 'text-red-600'}>
                  {option.is_active ? '✓ Aktivt' : '✗ Inaktivt'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(option)}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                Redigera
              </button>
              <button
                onClick={() => handleDelete(option.id)}
                className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
              >
                Ta bort
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
