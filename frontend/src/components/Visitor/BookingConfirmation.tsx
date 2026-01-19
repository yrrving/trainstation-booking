interface BookingConfirmationProps {
  onNewBooking: () => void;
}

export default function BookingConfirmation({ onNewBooking }: BookingConfirmationProps) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-2xl font-bold mb-2 text-gray-100">Bokning bekräftad!</h2>
      <p className="text-gray-400 mb-6">Din bokning har skapats och bekräftats.</p>
      <button
        onClick={onNewBooking}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
      >
        Gör en ny bokning
      </button>
    </div>
  );
}
