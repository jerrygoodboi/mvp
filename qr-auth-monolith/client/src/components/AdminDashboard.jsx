import React, { useState, useEffect } from 'react';
import { 
    adminLogin, fetchStudents, unbindDevice, deleteStudent, 
    fetchHistory, fetchSessions, addStudent, updateStudent 
} from '../utils/api';

const AdminDashboard = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('adminToken'));
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [activeTab, setActiveTab] = useState('students');
    const [data, setData] = useState({ students: [], history: [], sessions: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Form state for adding/editing students
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [studentForm, setStudentForm] = useState({ studentId: '', name: '', email: '' });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const result = await adminLogin(credentials);
            localStorage.setItem('adminToken', result.token);
            setIsLoggedIn(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        setIsLoggedIn(false);
    };

    const loadData = async () => {
        if (!isLoggedIn) return;
        setLoading(true);
        try {
            if (activeTab === 'students') {
                const res = await fetchStudents();
                setData(prev => ({ ...prev, students: res }));
            } else if (activeTab === 'history') {
                const res = await fetchHistory();
                setData(prev => ({ ...prev, history: res }));
            } else if (activeTab === 'sessions') {
                const res = await fetchSessions();
                setData(prev => ({ ...prev, sessions: res }));
            }
        } catch (err) {
            setError('Failed to fetch data');
            if (err.response?.status === 401 || err.response?.status === 403) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [isLoggedIn, activeTab]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateStudent(editingId, studentForm);
            } else {
                await addStudent(studentForm);
            }
            setShowForm(false);
            setEditingId(null);
            setStudentForm({ studentId: '', name: '', email: '' });
            loadData();
        } catch (err) {
            alert(err.response?.data?.error || 'Operation failed');
        }
    };

    const openEditForm = (student) => {
        setEditingId(student.id);
        setStudentForm({ studentId: student.studentId, name: student.name, email: student.email });
        setShowForm(true);
    };

    const handleUnbind = async (studentId) => {
        if (window.confirm(`Unbind device for student ${studentId}?`)) {
            try {
                await unbindDevice(studentId);
                loadData();
            } catch (err) {
                alert('Unbind failed');
            }
        }
    };

    const handleDelete = async (studentId) => {
        if (window.confirm(`Permanently delete student ${studentId}?`)) {
            try {
                await deleteStudent(studentId);
                loadData();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-navy-dark p-4">
                <div className="max-w-md w-full bg-navy-light p-8 rounded-2xl shadow-2xl border border-slate-700">
                    <h1 className="text-2xl font-bold text-teal-light mb-6 text-center">Admin Access</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
                            <input
                                type="text"
                                className="w-full bg-navy p-3 rounded-lg border border-slate-600 focus:border-teal outline-none transition-all"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                            <input
                                type="password"
                                className="w-full bg-navy p-3 rounded-lg border border-slate-600 focus:border-teal outline-none transition-all"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button type="submit" className="w-full py-3 bg-teal hover:bg-teal-dark text-white font-bold rounded-lg transition-colors">
                            Login as Administrator
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy text-white p-6">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-10 pb-6 border-b border-navy-light">
                    <div>
                        <h1 className="text-3xl font-bold text-teal-light">Admin Control Center</h1>
                        <p className="text-slate-400">Manage students, devices, and security</p>
                    </div>
                    <button onClick={handleLogout} className="px-5 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600 hover:text-white transition-all font-medium">
                        Logout
                    </button>
                </header>

                <div className="flex justify-between items-center mb-8">
                    <div className="flex space-x-2 bg-navy-light p-1 rounded-xl w-fit">
                        {['students', 'history', 'sessions'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-lg capitalize font-medium transition-all ${activeTab === tab ? 'bg-teal text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    
                    {activeTab === 'students' && (
                        <button 
                            onClick={() => { setShowForm(true); setEditingId(null); setStudentForm({studentId:'', name:'', email:''}); }}
                            className="px-4 py-2 bg-teal hover:bg-teal-dark text-white rounded-lg font-bold transition-all flex items-center"
                        >
                            <span className="mr-2">+</span> Add Student
                        </button>
                    )}
                </div>

                {/* Modal Form for Add/Edit */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-navy-light w-full max-w-md p-8 rounded-2xl border border-slate-700 shadow-2xl">
                            <h2 className="text-xl font-bold text-white mb-6">{editingId ? 'Edit Student' : 'Add New Student'}</h2>
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Student ID</label>
                                    <input
                                        type="text"
                                        className="w-full bg-navy p-3 rounded-lg border border-slate-600 focus:border-teal outline-none transition-all"
                                        value={studentForm.studentId}
                                        onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-navy p-3 rounded-lg border border-slate-600 focus:border-teal outline-none transition-all"
                                        value={studentForm.name}
                                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-navy p-3 rounded-lg border border-slate-600 focus:border-teal outline-none transition-all"
                                        value={studentForm.email}
                                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex space-x-3 mt-8">
                                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 py-2 bg-teal hover:bg-teal-dark text-white font-bold rounded-lg transition-colors">
                                        {editingId ? 'Update' : 'Save Student'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20"><div className="spinner"></div></div>
                ) : (
                    <div className="bg-navy-light rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                        {activeTab === 'students' && (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-navy border-b border-slate-700">
                                    <tr>
                                        <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">Student ID</th>
                                        <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">Name</th>
                                        <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">Device Status</th>
                                        <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.students.map(s => (
                                        <tr key={s.id} className="border-b border-slate-800 hover:bg-navy/50 transition-colors">
                                            <td className="p-4 font-mono text-teal-light font-medium">{s.studentId}</td>
                                            <td className="p-4">{s.name}</td>
                                            <td className="p-4">
                                                {s.deviceId ? (
                                                    <span className="flex items-center text-emerald-400 text-sm">
                                                        <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                                                        Paired: {s.deviceId.substring(0, 10)}...
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500 text-sm">Not Paired</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <button onClick={() => openEditForm(s)} className="px-3 py-1 text-xs bg-teal/20 text-teal-light border border-teal/30 rounded hover:bg-teal hover:text-white transition-all">
                                                    Edit
                                                </button>
                                                {s.deviceId && (
                                                    <button onClick={() => handleUnbind(s.studentId)} className="px-3 py-1 text-xs bg-amber-600/20 text-amber-400 border border-amber-600/30 rounded hover:bg-amber-600 hover:text-white transition-all">
                                                        Unbind
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(s.studentId)} className="px-3 py-1 text-xs bg-red-600/20 text-red-400 border border-red-600/30 rounded hover:bg-red-600 hover:text-white transition-all">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'history' && (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-navy border-b border-slate-700">
                                    <tr>
                                        <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">Time</th>
                                        <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">Student</th>
                                        <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.history.map(h => (
                                        <tr key={h.id} className="border-b border-slate-800 hover:bg-navy/50 transition-colors">
                                            <td className="p-4 text-slate-400 text-sm">{new Date(h.timestamp).toLocaleString()}</td>
                                            <td className="p-4 font-medium">{h.name} ({h.studentId})</td>
                                            <td className="p-4">
                                                {h.success ? (
                                                    <span className="text-emerald-400 text-sm font-semibold">Success</span>
                                                ) : (
                                                    <span className="text-red-400 text-sm font-semibold">Failed Attempt</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'sessions' && (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-navy border-b border-slate-700">
                                    <tr>
                                        <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">Created</th>
                                        <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">Expires At</th>
                                        <th className="p-4 text-slate-400 font-semibold uppercase text-xs tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.sessions.map(s => (
                                        <tr key={s.id} className="border-b border-slate-800 hover:bg-navy/50 transition-colors">
                                            <td className="p-4 text-slate-400 text-sm">{new Date(s.createdAt).toLocaleTimeString()}</td>
                                            <td className="p-4 text-slate-400 text-sm">{new Date(s.expiresAt).toLocaleTimeString()}</td>
                                            <td className="p-4">
                                                {s.scanned ? (
                                                    <span className="text-emerald-400 text-sm">Scanned</span>
                                                ) : new Date(s.expiresAt) < new Date() ? (
                                                    <span className="text-slate-500 text-sm italic">Expired</span>
                                                ) : (
                                                    <span className="text-teal-light text-sm animate-pulse">Active</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
