import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard component for logged-in users
 */
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loginTime, setLoginTime] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Basic route protection
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      console.log('No user found, redirecting to login');
      navigate('/');
      return;
    }

    setUser(JSON.parse(storedUser));
    // Set a mock login time for demonstration
    setLoginTime(new Date().toLocaleTimeString());
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('Logged out successfully');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-navy text-white p-6 sm:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-navy-light pb-8 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-teal-light">Student Portal</h1>
            <p className="text-slate-400 mt-2 italic">Session started at: {loginTime}</p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-6 sm:mt-0 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            Sign Out
          </button>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-navy-light p-8 rounded-2xl shadow-xl border border-slate-700 hover:border-teal transition-all">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <span className="w-8 h-8 bg-teal flex items-center justify-center rounded-full mr-3 text-sm">✓</span>
              Profile Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Name</label>
                <p className="text-lg text-white font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Student ID</label>
                <p className="text-lg text-white font-medium">{user.studentId}</p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Email</label>
                <p className="text-lg text-white font-medium">{user.email}</p>
              </div>
            </div>
          </section>

          <section className="bg-navy-light p-8 rounded-2xl shadow-xl border border-slate-700 hover:border-teal transition-all">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <span className="w-8 h-8 bg-teal flex items-center justify-center rounded-full mr-3 text-sm">🔒</span>
              Security Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Authentication Method</label>
                <p className="text-lg text-white font-medium">QR Code Scan (Passwordless)</p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Account Status</label>
                <p className="text-lg text-emerald-400 font-medium">Verified & Active</p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Session Expiry</label>
                <p className="text-lg text-white font-medium">24 Hours</p>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-16 text-center text-slate-500 text-sm">
          <p>© 2026 QR Auth Portal • Academic Information System</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
