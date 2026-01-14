import { useState } from 'react';
import type { BookingOption, WeeklyHours, CreateBookingOptionRequest } from '../../types';
import { BookingMode } from '../../types';
import { bookingOptionsAPI } from '../../api/client';

interface OptionEditorProps {
  locationId: string;
  mode: BookingMode;
  existingOption?: BookingOption;
  onSuccess: () => void;
  onCancel: () => void;
}

const WEEKDAY_LABELS = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];

export default function OptionEditor({ locationId, mode, existingOption, onSuccess, onCancel }: OptionEditorProps) {
  const [formData, setFormData] = useState({
    label: existingOption?.label || '',
    description: existingOption?.description || '',
    duration_minutes: existingOption?.duration_minutes || 60,
    max_people: existingOption?.capacity.max_people || 1,
    slot_increment_minutes: existingOption?.rules.slot_increment_minutes || 60,
    min_advance_minutes: existingOption?.rules.min_advance_minutes || 60,
    max_advance_days: existingOption?.rules.max_advance_days || 30,
    cancellation_cutoff_minutes: existingOption?.rules.cancellation_cutoff_minutes || 120,
    buffer_before_minutes: existingOption?.rules.buffer_before_minutes || 0,
    buffer_after_minutes: existingOption?.rules.buffer_after_minutes || 0,
    is_active: existingOption?.is_active ?? true,
  });

  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours[]>(
    existingOption?.weekly_hours || [{ weekday: 1, start: '09:00', end: '17:00' }]
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function addWeeklyHour() {
    setWeeklyHours([...weeklyHours, { weekday: 1, start: '09:00', end: '17:00' }]);
  }

  function removeWeeklyHour(index: number) {
    setWeeklyHours(weeklyHours.filter((_, i) => i !== index));
  }

  function updateWeeklyHour(index: number, field: keyof WeeklyHours, value: any) {
    const updated = [...weeklyHours];
    updated[index] = { ...updated[index], [field]: value };
    setWeeklyHours(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (weeklyHours.length === 0) {
      setError('Du måste lägga till minst en öppettid');
      return;
    }

    setSubmitting(true);

    try {
      const request: CreateBookingOptionRequest = {
        location_id: locationId,
        mode,
        label: formData.label,
        description: formData.description,
        duration_minutes: formData.duration_minutes,
        capacity: { max_people: formData.max_people },
        rules: {
          slot_increment_minutes: formData.slot_increment_minutes,
          min_advance_minutes: formData.min_advance_minutes,
          max_advance_days: formData.max_advance_days,
          cancellation_cutoff_minutes: formData.cancellation_cutoff_minutes,
          buffer_before_minutes: formData.buffer_before_minutes,
          buffer_after_minutes: formData.buffer_after_minutes,
        },
        weekly_hours: weeklyHours,
        is_active: formData.is_active,
      };

      if (existingOption) {
        await bookingOptionsAPI.update(existingOption.id, request);
      } else {
        await bookingOptionsAPI.create(request);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
      <h2 className="text-xl font-semibold">
        {existingOption ? 'Redigera bokningsalternativ' : 'Nytt bokningsalternativ'}
      </h2>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-gray-700">Grundläggande information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Namn *</label>
          <input
            type="text"
            required
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="t.ex. Studio A"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivning *</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Beskriv vad som kan bokas"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Längd (minuter) *</label>
            <input
              type="number"
              required
              min={1}
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max antal personer *</label>
            <input
              type="number"
              required
              min={1}
              value={formData.max_people}
              onChange={(e) => setFormData({ ...formData, max_people: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Aktivt (visas för besökare)</span>
        </label>
      </div>

      {/* Rules */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-sm text-gray-700">Bokningsregler</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slot-inkrement (min) *
            </label>
            <input
              type="number"
              required
              min={1}
              value={formData.slot_increment_minutes}
              onChange={(e) => setFormData({ ...formData, slot_increment_minutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Hur ofta slots genereras (t.ex. 30 eller 60 min)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min framförhållning (min) *
            </label>
            <input
              type="number"
              required
              min={0}
              value={formData.min_advance_minutes}
              onChange={(e) => setFormData({ ...formData, min_advance_minutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minsta tid innan bokning kan göras</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max framförhållning (dagar) *
            </label>
            <input
              type="number"
              required
              min={1}
              value={formData.max_advance_days}
              onChange={(e) => setFormData({ ...formData, max_advance_days: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Hur långt fram kan man boka</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avbokningsgräns (min) *
            </label>
            <input
              type="number"
              required
              min={0}
              value={formData.cancellation_cutoff_minutes}
              onChange={(e) => setFormData({ ...formData, cancellation_cutoff_minutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minsta tid innan start för avbokning</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buffer före (min) *</label>
            <input
              type="number"
              required
              min={0}
              value={formData.buffer_before_minutes}
              onChange={(e) => setFormData({ ...formData, buffer_before_minutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Buffert innan bokningen</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buffer efter (min) *</label>
            <input
              type="number"
              required
              min={0}
              value={formData.buffer_after_minutes}
              onChange={(e) => setFormData({ ...formData, buffer_after_minutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Buffert efter bokningen</p>
          </div>
        </div>
      </div>

      {/* Weekly Hours */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm text-gray-700">Öppettider</h3>
          <button
            type="button"
            onClick={addWeeklyHour}
            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm hover:bg-blue-100"
          >
            + Lägg till tid
          </button>
        </div>

        {weeklyHours.map((wh, index) => (
          <div key={index} className="flex gap-2 items-start">
            <select
              value={wh.weekday}
              onChange={(e) => updateWeeklyHour(index, 'weekday', parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {WEEKDAY_LABELS.map((label, day) => (
                <option key={day} value={day}>
                  {label}
                </option>
              ))}
            </select>

            <input
              type="time"
              value={wh.start}
              onChange={(e) => updateWeeklyHour(index, 'start', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <span className="py-2">-</span>

            <input
              type="time"
              value={wh.end}
              onChange={(e) => updateWeeklyHour(index, 'end', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={() => removeWeeklyHour(index)}
              className="px-3 py-2 bg-red-50 text-red-700 rounded-md text-sm hover:bg-red-100"
            >
              Ta bort
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition"
        >
          Avbryt
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition disabled:opacity-50"
        >
          {submitting ? 'Sparar...' : existingOption ? 'Uppdatera' : 'Skapa'}
        </button>
      </div>
    </form>
  );
}
