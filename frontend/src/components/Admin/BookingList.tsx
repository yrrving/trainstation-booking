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
    return <div className="text-center py-8">Laddar bokningar...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">Fel: {error}</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">Inga bokningar hittades med de valda filtren.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum & Tid</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plats</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bokningssätt</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Namn</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontakt</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Antal</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Åtgärder</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {bookings.map((booking) => {
            const startTime = DateTime.fromISO(booking.start_time, { zone: 'Europe/Stockholm' });

            return (
              <tr key={booking.id}>
                <td className="px-4 py-3 text-sm">
                  <div>{startTime.toFormat('yyyy-MM-dd')}</div>
                  <div className="text-gray-500">{startTime.toFormat('HH:mm')}</div>
                </td>
                <td className="px-4 py-3 text-sm">{booking.location_id}</td>
                <td className="px-4 py-3 text-sm">{booking.mode}</td>
                <td className="px-4 py-3 text-sm font-medium">{booking.booker.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {booking.booker.email && <div>{booking.booker.email}</div>}
                  {booking.booker.phone && <div>{booking.booker.phone}</div>}
                </td>
                <td className="px-4 py-3 text-sm">{booking.num_people}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.state === BookingState.CONFIRMED
                        ? 'bg-green-100 text-green-800'
                        : booking.state === BookingState.CANCELLED
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {booking.state}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {booking.state !== BookingState.CANCELLED && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
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
  );
}
