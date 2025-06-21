import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ManagerDashboard from './components/ManagerDashboard';
import EngineerDashboard from './components/EngineerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/manager-dashboard" 
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/engineer-dashboard" 
            element={
              <ProtectedRoute allowedRoles={["engineer"]}>
                <EngineerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
