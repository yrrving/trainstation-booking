import { useState, useEffect } from 'react';
import type { Booking } from '../../types';
import { BookingState } from '../../types';
import { bookingsAPI } from '../../api/client';
import { DateTime } from 'luxon';

interface MyBookingsProps {
  onBookNew: () => void;
}

export default function MyBookings({ onBookNew }: MyBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);
    try {
      const res = await bookingsAPI.getMine();
      setBookings(res.bookings);
    } catch (err) {
      setError((err instanceof Error ? err.message : 'Okänt fel'));
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Vill du avboka denna bokning?')) return;
    try {
      await bookingsAPI.cancel(id);
      loadBookings();
    } catch (err) {
      alert('Kunde inte avboka: ' + (err instanceof Error ? err.message : 'Okänt fel'));
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-300">Laddar dina bokningar...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-8">Fel: {error}</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center space-y-4">
        <p className="text-gray-400">Du har inga bokningar ännu.</p>
        <button
          onClick={onBookNew}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
        >
          Gör din första bokning
        </button>
      </div>
    );
  }

  const now = DateTime.now().setZone('Europe/Stockholm');

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-100">Mina bokningar</h2>
      <div className="space-y-3">
        {bookings.map((b) => {
          const start = DateTime.fromISO(b.start_time, { zone: 'Europe/Stockholm' });
          const end = DateTime.fromISO(b.end_time, { zone: 'Europe/Stockholm' });
          const isCancelled = b.state === BookingState.CANCELLED;
          const isPast = end < now;

          return (
            <div
              key={b.id}
              className={`bg-gray-800 border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                isCancelled ? 'border-gray-700 opacity-60' : 'border-gray-700'
              }`}
            >
              <div>
                <div className="font-semibold text-gray-100">
                  {b.option_label || b.mode}
                </div>
                <div className="text-sm text-gray-400 capitalize mt-0.5">
                  {start.setLocale('sv').toFormat('EEEE d MMMM')} · {start.toFormat('HH:mm')}–{end.toFormat('HH:mm')}
                </div>
                <div className="mt-1">
                  {isCancelled ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/50 text-red-300">Avbokad</span>
                  ) : isPast ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">Genomförd</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/50 text-green-300">Bekräftad</span>
                  )}
                </div>
              </div>
              {!isCancelled && !isPast && (
                <button
                  onClick={() => handleCancel(b.id)}
                  className="shrink-0 px-4 py-2 text-red-400 hover:text-red-300 font-medium text-sm border border-red-900/50 rounded-md hover:bg-red-900/20"
                >
                  Avboka
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
