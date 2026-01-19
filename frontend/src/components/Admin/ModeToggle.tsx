import { useState } from 'react';
import type { Location } from '../../types';
import { BookingMode } from '../../types';
import { locationsAPI } from '../../api/client';

interface ModeToggleProps {
  location: Location;
  onUpdate: () => void;
}

const MODE_LABELS: Record<BookingMode, string> = {
  [BookingMode.HANDLEDNING]: 'Handledning med personal',
  [BookingMode.RUM]: 'Boka rum (studio)',
  [BookingMode.STUDIEBESOK]: 'Studiebesök',
  [BookingMode.GRUPP]: 'Grupp (skolklass/fritidsgård)',
  [BookingMode.INDIVIDUELL]: 'Individuell (självgående)',
};

const ALL_MODES = Object.values(BookingMode);

export default function ModeToggle({ location, onUpdate }: ModeToggleProps) {
  const [enabledModes, setEnabledModes] = useState<BookingMode[]>(location.enabled_modes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleToggleMode(mode: BookingMode) {
    if (enabledModes.includes(mode)) {
      setEnabledModes(enabledModes.filter((m) => m !== mode));
    } else {
      setEnabledModes([...enabledModes, mode]);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await locationsAPI.updateModes(location.id, enabledModes);
      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-100">Aktiverade bokningssätt</h3>
      <p className="text-sm text-gray-400">Välj vilka bokningssätt som ska vara tillgängliga för {location.name}</p>

      {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded text-sm">{error}</div>}

      {success && (
        <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-2 rounded text-sm">
          Uppdaterat!
        </div>
      )}

      <div className="space-y-2">
        {ALL_MODES.map((mode) => (
          <label key={mode} className="flex items-center gap-3 p-3 bg-gray-700 border border-gray-600 rounded-md cursor-pointer hover:bg-gray-600">
            <input
              type="checkbox"
              checked={enabledModes.includes(mode)}
              onChange={() => handleToggleMode(mode)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 bg-gray-600 border-gray-500"
            />
            <span className="flex-1 text-gray-200">{MODE_LABELS[mode]}</span>
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition disabled:opacity-50"
      >
        {saving ? 'Sparar...' : 'Spara ändringar'}
      </button>
    </div>
  );
}
