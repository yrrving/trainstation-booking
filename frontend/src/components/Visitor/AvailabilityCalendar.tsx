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
    return <div className="text-center py-8 text-gray-300">Laddar tillgängliga tider...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-8">Fel: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-gray-100">Välj tid</h2>
        <p className="text-sm text-gray-400">{bookingOption.label}</p>
      </div>

      {/* Date navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        <div className="flex gap-2 order-2 sm:order-1">
          <button
            onClick={handlePrevWeek}
            className="flex-1 sm:flex-none px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-sm"
          >
            ← Förra
          </button>
          <button
            onClick={handleNextWeek}
            className="flex-1 sm:flex-none px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-sm sm:order-3"
          >
            Nästa →
          </button>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="flex-1 px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md order-1 sm:order-2"
        />
      </div>

      {/* Available slots grouped by date */}
      {Object.keys(slotsByDate).length === 0 ? (
        <div className="text-center py-8 text-gray-400">
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
              <div key={date} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <h3 className="font-semibold mb-3 capitalize text-gray-100">{dayName}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {availableSlots.map((slot) => {
                    const startTime = DateTime.fromISO(slot.start_time, {
                      zone: 'Europe/Stockholm',
                    }).toFormat('HH:mm');

                    return (
                      <button
                        key={slot.start_time}
                        onClick={() => onSelectSlot(slot)}
                        className="px-3 py-2 bg-blue-900/50 border border-blue-700 hover:bg-blue-800/50 hover:border-blue-500 rounded-md text-sm font-medium text-blue-300 transition"
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
