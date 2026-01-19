import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-100">trainstation</h1>
        {user && (
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">
              {user.username} ({user.role})
            </span>
            <span className="text-xs text-gray-400 sm:hidden">
              {user.username}
            </span>
            <button
              onClick={logout}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-xs sm:text-sm font-medium transition"
            >
              Logga ut
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
