import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ERMS Dashboard
              </h1>
              <p className="text-gray-600">
                Engineering Resource Management System
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome to ERMS Dashboard
              </h2>
              <p className="text-gray-600 mb-4">
                This is where you'll manage engineering resources, projects, and teams.
              </p>
              <p className="text-sm text-gray-500">
                Dashboard features coming soon...
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 