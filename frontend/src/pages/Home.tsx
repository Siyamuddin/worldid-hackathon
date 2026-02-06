import { Link } from 'react-router-dom';
import { WalletConnect } from '../components/WalletConnect';

export function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold">WorldID Rewards</h1>
            <div className="flex gap-4">
              <Link
                to="/events"
                className="px-4 py-2 text-blue-600 hover:text-blue-800"
              >
                Browse Events
              </Link>
              <Link
                to="/organizer"
                className="px-4 py-2 text-blue-600 hover:text-blue-800"
              >
                Organizer Dashboard
              </Link>
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">
            Event-Based Reward Distribution
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join events and claim rewards securely with WorldID verification
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/events"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Browse Events
            </Link>
            <Link
              to="/organizer"
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Create Event
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
