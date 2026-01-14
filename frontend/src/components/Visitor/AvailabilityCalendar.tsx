import { useState, useEffect } from 'react';
import type { BookingOption, TimeSlot } from '../../types';
import { availabilityAPI } from '../../api/client';
import { DateTime } from 'luxon';

interface AvailabilityCalendarProps {
  bookingOption: BookingOption;
  onSelectSlot: (slot: TimeSlot) => void;
}

export default function AvailabilityCalendar({ bookingOption, onSelectSlot }: AvailabilityCalendarProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Set initial date to today
  useEffect(() => {
    const today = DateTime.now().setZone('Europe/Stockholm').toISODate();
    if (today) setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadAvailability();
    }
  }, [selectedDate, bookingOption.id]);

  async function loadAvailability() {
    setLoading(true);
    try {
      // Load slots for the selected week (7 days from selected date)
      const startDate = selectedDate;
      const endDate = DateTime.fromISO(selectedDate)
        .plus({ days: 6 })
        .toISODate();

      if (!endDate) return;

      const response: any = await availabilityAPI.getSlots(bookingOption.id, startDate, endDate);
      setSlots(response.slots);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedDate(e.target.value);
  }

  function handleNextWeek() {
    const nextWeek = DateTime.fromISO(selectedDate).plus({ weeks: 1 }).toISODate();
    if (nextWeek) setSelectedDate(nextWeek);
  }

  function handlePrevWeek() {
    const prevWeek = DateTime.fromISO(selectedDate).minus({ weeks: 1 }).toISODate();
    if (prevWeek) setSelectedDate(prevWeek);
  }

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    const date = slot.start_time.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  if (loading) {
    return <div className="text-center py-8">Laddar tillgängliga tider...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">Fel: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Välj tid</h2>
        <p className="text-sm text-gray-600">{bookingOption.label}</p>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrevWeek}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
        >
          ← Förra veckan
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={handleNextWeek}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
        >
          Nästa vecka →
        </button>
      </div>

      {/* Available slots grouped by date */}
      {Object.keys(slotsByDate).length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          Inga lediga tider under denna period. Prova en annan vecka.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(slotsByDate).map(([date, dateSlots]) => {
            const dt = DateTime.fromISO(date, { zone: 'Europe/Stockholm' });
            const dayName = dt.setLocale('sv').toFormat('EEEE d MMMM');

            const availableSlots = dateSlots.filter((s) => s.available);

            if (availableSlots.length === 0) return null;

            return (
              <div key={date} className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-3 capitalize">{dayName}</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {availableSlots.map((slot) => {
                    const startTime = DateTime.fromISO(slot.start_time, {
                      zone: 'Europe/Stockholm',
                    }).toFormat('HH:mm');

                    return (
                      <button
                        key={slot.start_time}
                        onClick={() => onSelectSlot(slot)}
                        className="px-3 py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-400 rounded-md text-sm font-medium text-blue-700 transition"
                      >
                        {startTime}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
