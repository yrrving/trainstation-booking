import { useState } from 'react';
import Header from '../components/Layout/Header';
import LocationTree from '../components/Admin/LocationTree';
import ModeToggle from '../components/Admin/ModeToggle';
import OptionList from '../components/Admin/OptionList';
import OptionEditor from '../components/Admin/OptionEditor';
import BookingList from '../components/Admin/BookingList';
import BookingFilters from '../components/Admin/BookingFilters';
import type { Location, BookingOption } from '../types';
import { BookingMode } from '../types';

type AdminView = 'location_management' | 'booking_management';

const MODE_LABELS: Record<BookingMode, string> = {
  [BookingMode.HANDLEDNING]: 'Handledning',
  [BookingMode.RUM]: 'Rum',
  [BookingMode.STUDIEBESOK]: 'Studiebesök',
  [BookingMode.GRUPP]: 'Grupp',
  [BookingMode.INDIVIDUELL]: 'Individuell',
};

export default function AdminPage() {
  const [view, setView] = useState<AdminView>('location_management');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedMode, setSelectedMode] = useState<BookingMode | null>(null);
  const [editingOption, setEditingOption] = useState<BookingOption | null>(null);
  const [showNewOptionForm, setShowNewOptionForm] = useState(false);
  const [bookingFilters, setBookingFilters] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  function handleLocationUpdate() {
    setRefreshKey((k) => k + 1);
  }

  function handleOptionSuccess() {
    setEditingOption(null);
    setShowNewOptionForm(false);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setView('location_management')}
            className={`px-4 py-2 font-medium transition ${
              view === 'location_management'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Platser & Bokningsalternativ
          </button>
          <button
            onClick={() => setView('booking_management')}
            className={`px-4 py-2 font-medium transition ${
              view === 'booking_management'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Hantera bokningar
          </button>
        </div>

        {/* Location Management View */}
        {view === 'location_management' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar with locations */}
            <div className="lg:col-span-3">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <LocationTree
                  key={refreshKey}
                  onSelectLocation={setSelectedLocation}
                  selectedLocationId={selectedLocation?.id}
                />
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-9">
              {!selectedLocation ? (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center text-gray-400">
                  Välj en plats till vänster för att börja
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Mode Toggle */}
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <ModeToggle location={selectedLocation} onUpdate={handleLocationUpdate} />
                  </div>

                  {/* Mode Tabs */}
                  <div className="bg-gray-800 rounded-lg border border-gray-700">
                    <div className="border-b border-gray-700 px-6 py-4">
                      <h3 className="font-semibold text-gray-100">Bokningsalternativ per bokningssätt</h3>
                    </div>

                    <div className="flex gap-2 px-6 py-3 border-b border-gray-700 overflow-x-auto">
                      {selectedLocation.enabled_modes.map((mode) => (
                        <button
                          key={mode}
                          onClick={() => {
                            setSelectedMode(mode);
                            setShowNewOptionForm(false);
                            setEditingOption(null);
                          }}
                          className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition ${
                            selectedMode === mode
                              ? 'bg-blue-900/50 text-blue-300'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {MODE_LABELS[mode]}
                        </button>
                      ))}
                    </div>

                    <div className="p-6">
                      {!selectedMode ? (
                        <div className="text-center text-gray-400 py-8">
                          Välj ett bokningssätt ovan för att se alternativ
                        </div>
                      ) : showNewOptionForm || editingOption ? (
                        <OptionEditor
                          locationId={selectedLocation.id}
                          mode={selectedMode}
                          existingOption={editingOption || undefined}
                          onSuccess={handleOptionSuccess}
                          onCancel={() => {
                            setShowNewOptionForm(false);
                            setEditingOption(null);
                          }}
                        />
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-gray-200">Befintliga alternativ</h4>
                            <button
                              onClick={() => setShowNewOptionForm(true)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                            >
                              + Nytt alternativ
                            </button>
                          </div>
                          <OptionList
                            key={`${selectedLocation.id}-${selectedMode}-${refreshKey}`}
                            locationId={selectedLocation.id}
                            mode={selectedMode}
                            onEdit={setEditingOption}
                            onRefresh={handleLocationUpdate}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Booking Management View */}
        {view === 'booking_management' && (
          <div className="space-y-6">
            <BookingFilters onFilterChange={setBookingFilters} />
            <BookingList filters={bookingFilters} />
          </div>
        )}
      </div>
    </div>
  );
}
