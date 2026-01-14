import { useState, useEffect } from 'react';
import type { Location } from '../../types';
import { BookingMode } from '../../types';
import { locationsAPI } from '../../api/client';

interface ModeSelectorProps {
  locationId: string;
  onSelectMode: (mode: BookingMode) => void;
}

const MODE_LABELS: Record<BookingMode, string> = {
  [BookingMode.HANDLEDNING]: 'Handledning med personal',
  [BookingMode.RUM]: 'Boka rum (studio)',
  [BookingMode.STUDIEBESOK]: 'Studiebesök',
  [BookingMode.GRUPP]: 'Grupp (skolklass/fritidsgård)',
  [BookingMode.INDIVIDUELL]: 'Individuell (självgående)',
};

export default function ModeSelector({ locationId, onSelectMode }: ModeSelectorProps) {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLocation();
  }, [locationId]);

  async function loadLocation() {
    try {
      const response: any = await locationsAPI.getById(locationId);
      setLocation(response.location);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Laddar bokningssätt...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">Fel: {error}</div>;
  }

  if (!location) {
    return <div className="text-center py-8">Plats hittades inte</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Välj bokningssätt</h2>
        <p className="text-sm text-gray-600 mt-1">{location.name}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {location.enabled_modes.map((mode) => (
          <button
            key={mode}
            onClick={() => onSelectMode(mode)}
            className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition text-left"
          >
            <h3 className="font-semibold">{MODE_LABELS[mode]}</h3>
          </button>
        ))}
      </div>
    </div>
  );
}
