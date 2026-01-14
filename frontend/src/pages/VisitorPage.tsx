import { useState } from 'react';
import Header from '../components/Layout/Header';
import LocationSelector from '../components/Visitor/LocationSelector';
import ModeSelector from '../components/Visitor/ModeSelector';
import OptionSelector from '../components/Visitor/OptionSelector';
import AvailabilityCalendar from '../components/Visitor/AvailabilityCalendar';
import BookingForm from '../components/Visitor/BookingForm';
import BookingConfirmation from '../components/Visitor/BookingConfirmation';
import { useSession } from '../hooks/useSession';
import type { BookingOption, TimeSlot } from '../types';
import { BookingMode } from '../types';

type BookingStep = 'location' | 'mode' | 'option' | 'availability' | 'form' | 'confirmation';

export default function VisitorPage() {
  const { selectedLocationId, clearSelectedLocation } = useSession();
  const [step, setStep] = useState<BookingStep>('location');
  const [selectedMode, setSelectedMode] = useState<BookingMode | null>(null);
  const [selectedOption, setSelectedOption] = useState<BookingOption | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  function handleSelectMode(mode: BookingMode) {
    setSelectedMode(mode);
    setStep('option');
  }

  function handleSelectOption(option: BookingOption) {
    setSelectedOption(option);
    setStep('availability');
  }

  function handleSelectSlot(slot: TimeSlot) {
    setSelectedSlot(slot);
    setStep('form');
  }

  function handleBookingSuccess() {
    setStep('confirmation');
  }

  function handleNewBooking() {
    // Reset everything
    setSelectedMode(null);
    setSelectedOption(null);
    setSelectedSlot(null);
    clearSelectedLocation();
    setStep('location');
  }

  function handleBack() {
    if (currentStep === 'mode') {
      // Clear everything and go back to location selection
      setSelectedMode(null);
      setSelectedOption(null);
      setSelectedSlot(null);
      clearSelectedLocation();
    } else if (currentStep === 'option') {
      setSelectedMode(null);
      setSelectedOption(null);
      setSelectedSlot(null);
    } else if (currentStep === 'availability') {
      setSelectedOption(null);
      setSelectedSlot(null);
    } else if (currentStep === 'form') {
      setSelectedSlot(null);
    }
  }

  // Determine which step to show based on state
  const currentStep: BookingStep = !selectedLocationId
    ? 'location'
    : !selectedMode
    ? 'mode'
    : !selectedOption
    ? 'option'
    : !selectedSlot
    ? 'availability'
    : step;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button (except on first and last step) */}
        {currentStep !== 'location' && currentStep !== 'confirmation' && (
          <button
            onClick={handleBack}
            className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            ← Tillbaka
          </button>
        )}

        {/* Step content */}
        {currentStep === 'location' && <LocationSelector />}

        {currentStep === 'mode' && selectedLocationId && (
          <ModeSelector locationId={selectedLocationId} onSelectMode={handleSelectMode} />
        )}

        {currentStep === 'option' && selectedLocationId && selectedMode && (
          <OptionSelector locationId={selectedLocationId} mode={selectedMode} onSelectOption={handleSelectOption} />
        )}

        {currentStep === 'availability' && selectedOption && (
          <AvailabilityCalendar bookingOption={selectedOption} onSelectSlot={handleSelectSlot} />
        )}

        {currentStep === 'form' && selectedOption && selectedSlot && (
          <BookingForm
            bookingOption={selectedOption}
            selectedSlot={selectedSlot}
            onSuccess={handleBookingSuccess}
            onCancel={() => {
              setSelectedSlot(null);
              setStep('availability');
            }}
          />
        )}

        {currentStep === 'confirmation' && <BookingConfirmation onNewBooking={handleNewBooking} />}
      </main>
    </div>
  );
}
