import { useState, useEffect } from 'react';
import type { Wish, Location } from '../../types';
import { WishStatus } from '../../types';
import { wishesAPI, locationsAPI } from '../../api/client';
import { DateTime } from 'luxon';

const MODE_LABELS: Record<string, string> = {
  handledning: 'Handledning',
  rum: 'Rum',
  studiebesök: 'Studiebesök',
  grupp: 'Grupp',
  individuell: 'Individuell',
};

export default function WishList() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [locations, setLocations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [wRes, lRes] = await Promise.all([wishesAPI.getAll(), locationsAPI.getAll()]);
      setWishes(wRes.wishes);
      const map: Record<string, string> = {};
      (lRes.locations as Location[]).forEach((l) => (map[l.id] = l.name));
      setLocations(map);
    } catch (err) {
      setError((err instanceof Error ? err.message : 'Okänt fel'));
    } finally {
      setLoading(false);
    }
  }

  async function toggleHandled(w: Wish) {
    const next = w.status === WishStatus.HANDLED ? WishStatus.NEW : WishStatus.HANDLED;
    try {
      await wishesAPI.updateStatus(w.id, next);
      load();
    } catch (err) {
      alert('Kunde inte uppdatera: ' + (err instanceof Error ? err.message : 'Okänt fel'));
    }
  }

  if (loading) return <div className="text-center py-8 text-gray-300">Laddar önskemål...</div>;
  if (error) return <div className="text-red-400 text-center py-8">Fel: {error}</div>;

  if (wishes.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
        Inga önskemål har skickats in ännu.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {wishes.map((w) => {
        const handled = w.status === WishStatus.HANDLED;
        return (
          <div
            key={w.id}
            className={`bg-gray-800 border rounded-lg p-4 ${handled ? 'border-gray-700 opacity-60' : 'border-blue-800'}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-100">{w.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                    {locations[w.location_id] || w.location_id}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                    {MODE_LABELS[w.mode] || w.mode}
                    {w.option_label ? ` · ${w.option_label}` : ''}
                  </span>
                  {handled ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/50 text-green-300">Hanterad</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900/50 text-yellow-300">Ny</span>
                  )}
                </div>
                <div className="text-sm text-gray-200">
                  <span className="text-gray-500">Önskar:</span> {w.desired_time}
                </div>
                {w.message && <div className="text-sm text-gray-400">{w.message}</div>}
                <div className="text-xs text-gray-500">
                  {w.email && <span className="mr-3">✉️ {w.email}</span>}
                  {w.phone && <span>📞 {w.phone}</span>}
                </div>
                <div className="text-xs text-gray-600">
                  Inkom {DateTime.fromISO(w.created_at).setLocale('sv').toFormat('d MMM HH:mm')}
                </div>
              </div>
              <button
                onClick={() => toggleHandled(w)}
                className={`shrink-0 px-3 py-2 rounded-md text-sm font-medium transition ${
                  handled
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-green-700 hover:bg-green-600 text-white'
                }`}
              >
                {handled ? 'Markera som ny' : 'Markera hanterad'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
