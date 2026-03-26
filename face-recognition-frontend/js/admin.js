/**
 * admin.js - Admin Logic for Face Recognition
 */

const API_BASE_URL = window.FACE_CONFIG ? window.FACE_CONFIG.API_BASE_URL : 'http://10.138.24.4:4000'; // Match backend port

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    const loginStatus = document.getElementById('login-status');
    const logoutBtn = document.getElementById('logout-btn');

    const studentsBody = document.getElementById('students-body');
    const historyBody = document.getElementById('history-body');

    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const closeModal = document.getElementById('close-modal');

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    let adminToken = localStorage.getItem('faceAdminToken');

    // --- Init ---
    if (adminToken) {
        showPanel();
    }

    // --- Auth Logic ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || 'Login failed');

            adminToken = result.token;
            localStorage.setItem('faceAdminToken', adminToken);
            showPanel();
            hideStatus(loginStatus);
        } catch (err) {
            showStatus(loginStatus, err.message, 'error');
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('faceAdminToken');
        adminToken = null;
        loginContainer.classList.remove('hidden');
        adminPanel.classList.add('hidden');
    });

    // --- Tab Switching ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabContents.forEach(c => {
                if (c.id === `${tab}-tab`) {
                    c.classList.remove('hidden');
                } else {
                    c.classList.add('hidden');
                }
            });

            if (tab === 'students') loadStudents();
            if (tab === 'history') loadHistory();
        });
    });

    // --- Student Management ---
    async function loadStudents() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/students`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (!response.ok) throw new Error('Failed to fetch students');
            
            const students = await response.json();
            studentsBody.innerHTML = students.map(s => `
                <tr>
                    <td><strong>${s.student_id}</strong></td>
                    <td>${s.name}</td>
                    <td>${s.email}</td>
                    <td style="color: var(--text-muted); font-size: 0.75rem;">${new Date(s.created_at).toLocaleString()}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn btn-sm secondary" onclick="window.openEditModal(${JSON.stringify(s).replace(/"/g, '&quot;')})">Edit</button>
                            <button class="btn btn-sm primary" style="background: var(--error);" onclick="window.deleteStudent('${s.student_id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            alert(err.message);
        }
    }

    async function loadHistory() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/history`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (!response.ok) throw new Error('Failed to fetch history');
            
            const history = await response.json();
            historyBody.innerHTML = history.map(h => `
                <tr>
                    <td style="color: var(--text-muted); font-size: 0.75rem;">${new Date(h.timestamp).toLocaleString()}</td>
                    <td><strong>${h.name || 'Unknown'}</strong> (${h.student_id || 'N/A'})</td>
                    <td>
                        <span class="confidence-tag" style="background: ${h.status === 'SUCCESS' ? 'var(--success)' : 'var(--error)'}; color: white;">
                            ${h.status}
                        </span>
                    </td>
                    <td>${h.confidence ? (h.confidence * 100).toFixed(1) + '%' : '-'}</td>
                </tr>
            `).join('');
        } catch (err) {
            alert(err.message);
        }
    }

    // Modal Actions
    window.openEditModal = (student) => {
        document.getElementById('edit-db-id').value = student.id;
        document.getElementById('edit-student-id').value = student.student_id;
        document.getElementById('edit-name').value = student.name;
        document.getElementById('edit-email').value = student.email;
        editModal.classList.remove('hidden');
    };

    closeModal.addEventListener('click', () => editModal.classList.add('hidden'));

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-db-id').value;
        const studentId = document.getElementById('edit-student-id').value;
        const name = document.getElementById('edit-name').value;
        const email = document.getElementById('edit-email').value;

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/students/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ studentId, name, email })
            });

            if (!response.ok) throw new Error('Update failed');
            
            editModal.classList.add('hidden');
            loadStudents();
        } catch (err) {
            alert(err.message);
        }
    });

    window.deleteStudent = async (studentId) => {
        if (!confirm(`Are you sure you want to delete student ${studentId}? This will also remove their face data.`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/students/${studentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });

            if (!response.ok) throw new Error('Delete failed');
            loadStudents();
        } catch (err) {
            alert(err.message);
        }
    };

    // --- Helpers ---
    function showPanel() {
        loginContainer.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        loadStudents();
    }

    function showStatus(el, msg, type) {
        el.textContent = msg;
        el.className = `status-msg ${type}`;
        el.classList.remove('hidden');
    }

    function hideStatus(el) {
        el.classList.add('hidden');
    }
});
