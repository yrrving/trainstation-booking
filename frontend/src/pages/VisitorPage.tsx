import { useState } from 'react';
import Header from '../components/Layout/Header';
import LocationSelector from '../components/Visitor/LocationSelector';
import BookingPicker from '../components/Visitor/BookingPicker';
import AvailabilityCalendar from '../components/Visitor/AvailabilityCalendar';
import BookingForm from '../components/Visitor/BookingForm';
import WishForm from '../components/Visitor/WishForm';
import BookingConfirmation from '../components/Visitor/BookingConfirmation';
import MyBookings from '../components/Visitor/MyBookings';
import { useSession } from '../hooks/useSession';
import type { BookingOption, TimeSlot, BookingMode } from '../types';

type View = 'book' | 'mybookings';
type Step = 'picker' | 'availability' | 'form' | 'wish' | 'booking_done' | 'wish_done';

interface WishContext {
  mode: BookingMode;
  modeLabel: string;
  optionId?: string;
  optionLabel?: string;
}

const MODE_LABELS: Record<string, string> = {
  handledning: 'Handledning med personal',
  rum: 'Boka rum (studio)',
  studiebesök: 'Studiebesök',
  grupp: 'Grupp (skolklass/fritidsgård)',
  individuell: 'Individuell (självgående)',
};

export default function VisitorPage() {
  const { selectedLocationId, clearSelectedLocation } = useSession();
  const [view, setView] = useState<View>('book');
  const [step, setStep] = useState<Step>('picker');
  const [selectedOption, setSelectedOption] = useState<BookingOption | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [wishCtx, setWishCtx] = useState<WishContext | null>(null);

  function resetBooking() {
    setSelectedOption(null);
    setSelectedSlot(null);
    setWishCtx(null);
    setStep('picker');
  }

  function handleSelectOption(option: BookingOption) {
    setSelectedOption(option);
    setStep('availability');
  }

  function handleSelectSlot(slot: TimeSlot) {
    setSelectedSlot(slot);
    setStep('form');
  }

  function handleSendWish(mode: BookingMode, modeLabel: string, optionId?: string, optionLabel?: string) {
    setWishCtx({ mode, modeLabel, optionId, optionLabel });
    setStep('wish');
  }

  function handleNewBooking() {
    resetBooking();
    clearSelectedLocation();
  }

  function handleBack() {
    if (step === 'availability') {
      setSelectedOption(null);
      setStep('picker');
    } else if (step === 'form') {
      setSelectedSlot(null);
      setStep('availability');
    } else if (step === 'wish') {
      setWishCtx(null);
      setStep('picker');
    } else if (step === 'picker') {
      resetBooking();
      clearSelectedLocation();
    }
  }

  function switchView(next: View) {
    if (next === 'book') resetBooking();
    setView(next);
  }

  // ── My bookings view ────────────────────────────────────────────────
  if (view === 'mybookings') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ViewTabs view={view} onChange={switchView} />
          <MyBookings onBookNew={() => switchView('book')} />
        </main>
      </div>
    );
  }

  // ── Booking view ────────────────────────────────────────────────────
  const showBack =
    !!selectedLocationId &&
    step !== 'booking_done' &&
    step !== 'wish_done';

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ViewTabs view={view} onChange={switchView} />

        {showBack && (
          <button
            onClick={handleBack}
            className="mb-6 text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2"
          >
            ← Tillbaka
          </button>
        )}

        {/* Step 1: location (prototyp — i skarpt läge förvald) */}
        {!selectedLocationId && <LocationSelector />}

        {/* Step 2: picker (dropdown + dynamisk panel) */}
        {selectedLocationId && step === 'picker' && (
          <BookingPicker
            locationId={selectedLocationId}
            onSelectOption={handleSelectOption}
            onSendWish={(mode, modeLabel) => handleSendWish(mode, modeLabel)}
          />
        )}

        {/* Step 3: availability */}
        {selectedLocationId && step === 'availability' && selectedOption && (
          <AvailabilityCalendar
            bookingOption={selectedOption}
            onSelectSlot={handleSelectSlot}
            onSendWish={() =>
              handleSendWish(
                selectedOption.mode,
                MODE_LABELS[selectedOption.mode] || selectedOption.mode,
                selectedOption.id,
                selectedOption.label,
              )
            }
          />
        )}

        {/* Step 4a: booking form */}
        {selectedLocationId && step === 'form' && selectedOption && selectedSlot && (
          <BookingForm
            bookingOption={selectedOption}
            selectedSlot={selectedSlot}
            onSuccess={() => setStep('booking_done')}
            onCancel={() => {
              setSelectedSlot(null);
              setStep('availability');
            }}
          />
        )}

        {/* Step 4b: wish form */}
        {selectedLocationId && step === 'wish' && wishCtx && (
          <WishForm
            locationId={selectedLocationId}
            mode={wishCtx.mode}
            modeLabel={wishCtx.modeLabel}
            optionId={wishCtx.optionId}
            optionLabel={wishCtx.optionLabel}
            onCancel={() => {
              setWishCtx(null);
              setStep('picker');
            }}
            onSubmitted={() => setStep('wish_done')}
          />
        )}

        {/* Done states */}
        {step === 'booking_done' && <BookingConfirmation onNewBooking={handleNewBooking} />}
        {step === 'wish_done' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
            <div className="text-6xl mb-4">📨</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-100">Önskemål skickat!</h2>
            <p className="text-gray-400 mb-6">
              Tack! Personalen ser ditt önskemål och återkommer till dig.
            </p>
            <button
              onClick={handleNewBooking}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
            >
              Tillbaka till start
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function ViewTabs({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div className="flex gap-4 mb-6 border-b border-gray-700">
      <button
        onClick={() => onChange('book')}
        className={`px-4 py-2 font-medium transition ${
          view === 'book'
            ? 'border-b-2 border-blue-500 text-blue-400'
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        Boka
      </button>
      <button
        onClick={() => onChange('mybookings')}
        className={`px-4 py-2 font-medium transition ${
          view === 'mybookings'
            ? 'border-b-2 border-blue-500 text-blue-400'
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        Mina bokningar
      </button>
    </div>
  );
}
