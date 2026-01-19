import { useState, useEffect } from 'react';
import type { Booking } from '../../types';
import { BookingState } from '../../types';
import { bookingsAPI } from '../../api/client';
import { DateTime } from 'luxon';

interface BookingListProps {
  filters: {
    location_id?: string;
    mode?: string;
    start_date?: string;
    end_date?: string;
    state?: string;
  };
}

export default function BookingList({ filters }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookings();
  }, [filters]);

  async function loadBookings() {
    setLoading(true);
    try {
      const response: any = await bookingsAPI.getAll(filters);
      setBookings(response.bookings);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(bookingId: string) {
    if (!confirm('Är du säker på att du vill avboka denna bokning?')) {
      return;
    }

    try {
      await bookingsAPI.cancel(bookingId);
      loadBookings(); // Reload list
    } catch (err: any) {
      alert('Fel vid avbokning: ' + err.message);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-300">Laddar bokningar...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-8">Fel: {error}</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">Inga bokningar hittades med de valda filtren.</div>
    );
  }

  return (
    <>
      {/* Mobile view - cards */}
      <div className="md:hidden space-y-4">
        {bookings.map((booking) => {
          const startTime = DateTime.fromISO(booking.start_time, { zone: 'Europe/Stockholm' });

          return (
            <div key={booking.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-100">{booking.booker.name}</div>
                  <div className="text-sm text-gray-400">{booking.mode}</div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.state === BookingState.CONFIRMED
                      ? 'bg-green-900/50 text-green-300'
                      : booking.state === BookingState.CANCELLED
                      ? 'bg-red-900/50 text-red-300'
                      : 'bg-yellow-900/50 text-yellow-300'
                  }`}
                >
                  {booking.state}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Datum:</span>
                  <div className="text-gray-200">{startTime.toFormat('yyyy-MM-dd HH:mm')}</div>
                </div>
                <div>
                  <span className="text-gray-500">Antal:</span>
                  <div className="text-gray-200">{booking.num_people} pers</div>
                </div>
                <div>
                  <span className="text-gray-500">Plats:</span>
                  <div className="text-gray-200">{booking.location_id}</div>
                </div>
                <div>
                  <span className="text-gray-500">Kontakt:</span>
                  <div className="text-gray-200 text-xs">
                    {booking.booker.email || booking.booker.phone || '-'}
                  </div>
                </div>
              </div>
              {booking.state !== BookingState.CANCELLED && (
                <button
                  onClick={() => handleCancel(booking.id)}
                  className="w-full py-2 text-red-400 hover:text-red-300 font-medium text-sm border border-red-900/50 rounded-md hover:bg-red-900/20"
                >
                  Avboka
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop view - table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Datum & Tid</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Plats</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Bokningssätt</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Namn</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Kontakt</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Antal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {bookings.map((booking) => {
              const startTime = DateTime.fromISO(booking.start_time, { zone: 'Europe/Stockholm' });

              return (
                <tr key={booking.id}>
                  <td className="px-4 py-3 text-sm text-gray-200">
                    <div>{startTime.toFormat('yyyy-MM-dd')}</div>
                    <div className="text-gray-400">{startTime.toFormat('HH:mm')}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-200">{booking.location_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-200">{booking.mode}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-100">{booking.booker.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {booking.booker.email && <div>{booking.booker.email}</div>}
                    {booking.booker.phone && <div>{booking.booker.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-200">{booking.num_people}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.state === BookingState.CONFIRMED
                          ? 'bg-green-900/50 text-green-300'
                          : booking.state === BookingState.CANCELLED
                          ? 'bg-red-900/50 text-red-300'
                          : 'bg-yellow-900/50 text-yellow-300'
                      }`}
                    >
                      {booking.state}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {booking.state !== BookingState.CANCELLED && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="text-red-400 hover:text-red-300 font-medium"
                      >
                        Avboka
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
