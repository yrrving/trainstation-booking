import { useState } from 'react';
import type { BookingOption, TimeSlot, CreateBookingRequest } from '../../types';
import { bookingsAPI } from '../../api/client';
import { DateTime } from 'luxon';

interface BookingFormProps {
  bookingOption: BookingOption;
  selectedSlot: TimeSlot;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BookingForm({ bookingOption, selectedSlot, onSuccess, onCancel }: BookingFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    num_people: 1,
    notes: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const startTime = DateTime.fromISO(selectedSlot.start_time, { zone: 'Europe/Stockholm' });
  const endTime = DateTime.fromISO(selectedSlot.end_time, { zone: 'Europe/Stockholm' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validation: at least email or phone required
    if (!formData.email && !formData.phone) {
      setError('Du måste ange minst e-post eller telefon');
      return;
    }

    setSubmitting(true);

    try {
      const request: CreateBookingRequest = {
        booking_option_id: bookingOption.id,
        start_time: selectedSlot.start_time,
        booker: {
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
        },
        num_people: formData.num_people,
        notes: formData.notes || undefined,
      };

      await bookingsAPI.create(request);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Något gick fel vid bokningen');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Slutför bokning</h2>

      {/* Booking summary */}
      <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-300">{bookingOption.label}</h3>
        <p className="text-sm text-blue-400 mt-2">
          📅 {startTime.setLocale('sv').toFormat('EEEE d MMMM yyyy')}
        </p>
        <p className="text-sm text-blue-400">
          🕐 {startTime.toFormat('HH:mm')} - {endTime.toFormat('HH:mm')}
        </p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Namn <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">E-post</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Telefon</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Antal personer <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            required
            min={1}
            max={bookingOption.capacity.max_people}
            value={formData.num_people}
            onChange={(e) => setFormData({ ...formData, num_people: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Max {bookingOption.capacity.max_people} personer</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Övriga upplysningar</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <p className="text-xs text-gray-500">
          <span className="text-red-400">*</span> Du måste ange minst e-post eller telefon
        </p>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md font-medium transition"
          >
            Avbryt
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition disabled:opacity-50"
          >
            {submitting ? 'Bokar...' : 'Bekräfta bokning'}
          </button>
        </div>
      </form>
    </div>
  );
}
