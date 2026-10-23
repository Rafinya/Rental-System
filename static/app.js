// Frontend Logic for Weena Loft Rental Management System

// Global State
let state = {
    currentUser: null,
    units: [],
    tenants: [],
    payments: [],
    repairs: [],
    reminders: [],
    activeTab: 'tab-dashboard'
};

// Bulk messaging state
let bulkQueue = [];
let bulkCurrentIndex = 0;
let bulkDateType = 1;

// API Base URL
const API_URL = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuth();
});

// Check if user is logged in
function checkAuth() {
    const cachedUser = localStorage.getItem('weena_user');
    if (cachedUser) {
        state.currentUser = JSON.parse(cachedUser);
        showApp();
    } else {
        showLogin();
    }
}

// Show Login screen
function showLogin() {
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('welcome-modal').style.display = 'none';
}

// Show Main App screen
function showApp() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    
    // Set user profile details
    document.getElementById('user-display-role').textContent = state.currentUser.role;
    document.getElementById('mobile-user-display-role').textContent = state.currentUser.role;

    // Update avatar image/initials and names dynamically
    updateUIWithUserAvatar();

    // Load initial tab data
    switchTab(state.activeTab);
}

// Trigger welcome popup dialog
function triggerWelcomePopup() {
    const modal = document.getElementById('welcome-modal');
    const title = document.getElementById('welcome-title');
    const message = document.getElementById('welcome-message');
    const badge = document.getElementById('welcome-role-badge');
    const avatar = document.getElementById('welcome-avatar');

    if (state.currentUser.role === 'Main Owner') {
        badge.textContent = "MAIN OWNER";
        badge.style.background = "#ffb703";
        badge.style.color = "#0a0813";
        avatar.innerHTML = '<i class="fa-solid fa-crown"></i>';
        avatar.style.background = 'linear-gradient(135deg, #ffb703 0%, #ff8c00 100%)';
        title.textContent = `Welcome back, ${state.currentUser.name}!`;
        message.textContent = `As the Main Owner of Weena Loft, your workspace is loaded and ready. You will be receiving tax payment reminders on the 9th and 10th of every month. Keep track of arrears, rent collections, and repairs efficiently.`;
    } else {
        badge.textContent = "OWNER";
        badge.style.background = "#9d4edd";
        badge.style.color = "white";
        avatar.innerHTML = '<i class="fa-solid fa-user-shield"></i>';
        avatar.style.background = 'linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%)';
        title.textContent = `Welcome back, ${state.currentUser.name}!`;
        message.textContent = `Managing Weena Loft with excellence. All rental statistics, bank deposits, and tax notifications are synced. You are configured to receive monthly tax alerts.`;
    }

    modal.style.display = 'flex';
}

// Helper function to format phone numbers for WhatsApp API links
function formatWhatsAppNumber(phone) {
    if (!phone) return "";
    let clean = phone.trim().replace(/\D/g, ""); // Remove non-numeric characters
    if (clean.startsWith("0")) {
        clean = "254" + clean.substring(1);
    }
    if (!clean.startsWith("254") && clean.length === 9) {
        clean = "254" + clean;
    }
    return clean;
}

// Backend logout function
async function logoutSession() {
    try {
        await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.currentUser?.token}`
            }
        });
    } catch (err) {
        console.error("Backend session deletion failed:", err);
    }
    localStorage.removeItem('weena_user');
    state.currentUser = null;
    showLogin();
}

// Setup listeners
function setupEventListeners() {
    // Login Submit
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');
        errorDiv.style.display = 'none';

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Login failed');
            }

            const data = await res.json();
            state.currentUser = data;
            localStorage.setItem('weena_user', JSON.stringify(data));
            showApp();
            triggerWelcomePopup();
        } catch (err) {
            errorDiv.textContent = err.message;
            errorDiv.style.display = 'block';
        }
    });

    // Close welcome modal
    document.getElementById('btn-welcome-close').addEventListener('click', () => {
        document.getElementById('welcome-modal').style.display = 'none';
    });

    // Logout Action
    document.getElementById('logout-btn').addEventListener('click', () => {
        logoutSession();
    });

    document.getElementById('mobile-logout-btn').addEventListener('click', () => {
        logoutSession();
        const headerNavEl = document.getElementById('header-nav');
        if (headerNavEl) {
            headerNavEl.classList.remove('open');
        }
    });

    // Toggle mobile menu
    const menuToggle = document.getElementById('menu-toggle-btn');
    const headerNav = document.getElementById('header-nav');
    if (menuToggle && headerNav) {
        menuToggle.addEventListener('click', () => {
            headerNav.classList.toggle('open');
        });
    }

    // Tab Navigation
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.currentTarget.getAttribute('data-tab');
            switchTab(tabId);
            
            // Close mobile menu if open
            if (headerNav) {
                headerNav.classList.remove('open');
            }
        });
    });

    // Broadcast Buttons
    document.getElementById('btn-broadcast-rent').addEventListener('click', () => {
        startBulkWhatsApp('rent');
    });
    document.getElementById('btn-broadcast-7th').addEventListener('click', () => {
        startBulkWhatsApp('7th');
    });
    document.getElementById('btn-broadcast-tax').addEventListener('click', () => {
        startBulkWhatsApp('tax');
    });
    document.getElementById('btn-broadcast-bank').addEventListener('click', () => {
        startBulkWhatsApp('absa');
    });

    // Filter units
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const filterVal = e.currentTarget.getAttribute('data-filter');
            renderUnits(filterVal);
        });
    });

    // ==========================================
    // BULK DELETE PAYMENTS (checkbox system)
    // ==========================================
    document.getElementById('btn-toggle-delete-payments').addEventListener('click', () => {
        // Show checkboxes and confirm/cancel buttons
        document.querySelectorAll('.col-select-pay').forEach(el => el.style.display = '');
        document.getElementById('btn-toggle-delete-payments').style.display = 'none';
        document.getElementById('btn-confirm-delete-payments').style.display = 'inline-block';
        document.getElementById('btn-cancel-delete-payments').style.display = 'inline-block';
    });

    document.getElementById('btn-cancel-delete-payments').addEventListener('click', () => {
        // Hide checkboxes and reset
        document.querySelectorAll('.col-select-pay').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.pay-select-cb').forEach(cb => cb.checked = false);
        document.getElementById('select-all-payments').checked = false;
        document.getElementById('btn-toggle-delete-payments').style.display = 'inline-block';
        document.getElementById('btn-confirm-delete-payments').style.display = 'none';
        document.getElementById('btn-cancel-delete-payments').style.display = 'none';
    });

    document.getElementById('select-all-payments').addEventListener('change', (e) => {
        document.querySelectorAll('.pay-select-cb').forEach(cb => cb.checked = e.target.checked);
    });

    document.getElementById('btn-confirm-delete-payments').addEventListener('click', async () => {
        const selected = document.querySelectorAll('.pay-select-cb:checked');
        if (selected.length === 0) {
            alert('Please select at least one payment to delete.');
            return;
        }
        if (!confirm(`Are you sure you want to delete ${selected.length} payment(s)? This cannot be undone.`)) return;

        let successCount = 0;
        for (const cb of selected) {
            const payId = cb.getAttribute('data-pay-id');
            try {
                const res = await fetch(`${API_URL}/api/payments/${payId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${state.currentUser?.token}` }
                });
                if (res.ok) successCount++;
            } catch (err) { /* continue */ }
        }
        showToast(`${successCount} payment(s) deleted successfully.`);
        // Reset delete mode
        document.getElementById('btn-cancel-delete-payments').click();
        refreshCurrentTab();
    });

    // ==========================================
    // BULK EVICT TENANTS (checkbox on units)
    // ==========================================
    state.evictMode = false;

    document.getElementById('btn-toggle-evict').addEventListener('click', () => {
        state.evictMode = true;
        document.getElementById('btn-toggle-evict').style.display = 'none';
        document.getElementById('btn-confirm-evict').style.display = 'inline-block';
        document.getElementById('btn-cancel-evict').style.display = 'inline-block';
        // Re-render units with checkboxes
        const activeFilter = document.querySelector('.btn-filter.active');
        renderUnits(activeFilter ? activeFilter.getAttribute('data-filter') : 'all');
    });

    document.getElementById('btn-cancel-evict').addEventListener('click', () => {
        state.evictMode = false;
        document.getElementById('btn-toggle-evict').style.display = 'inline-block';
        document.getElementById('btn-confirm-evict').style.display = 'none';
        document.getElementById('btn-cancel-evict').style.display = 'none';
        const activeFilter = document.querySelector('.btn-filter.active');
        renderUnits(activeFilter ? activeFilter.getAttribute('data-filter') : 'all');
    });

    document.getElementById('btn-confirm-evict').addEventListener('click', async () => {
        const selected = document.querySelectorAll('.evict-select-cb:checked');
        if (selected.length === 0) {
            alert('Please select at least one tenant to evict.');
            return;
        }
        if (!confirm(`Are you sure you want to EVICT ${selected.length} tenant(s)? This cannot be undone.`)) return;

        let successCount = 0;
        for (const cb of selected) {
            const tenantId = cb.getAttribute('data-tenant-id');
            try {
                const res = await fetch(`${API_URL}/api/tenants/${tenantId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${state.currentUser?.token}` }
                });
                if (res.ok) successCount++;
            } catch (err) { /* continue */ }
        }
        showToast(`${successCount} tenant(s) evicted successfully.`);
        state.evictMode = false;
        document.getElementById('btn-toggle-evict').style.display = 'inline-block';
        document.getElementById('btn-confirm-evict').style.display = 'none';
        document.getElementById('btn-cancel-evict').style.display = 'none';
        refreshCurrentTab();
    });


    // Record payment submit (authorized)
    document.getElementById('payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const tenant_id = parseInt(document.getElementById('pay-tenant-id').value);
        const unit_id = document.getElementById('pay-unit-id').value;
        const amount_paid = parseFloat(document.getElementById('pay-amount').value);
        const payment_month = document.getElementById('pay-month').value;
        const payment_date = document.getElementById('pay-date').value;
        const reference = document.getElementById('pay-reference').value;

        try {
            const res = await fetch(`${API_URL}/api/payments`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.currentUser?.token}`
                },
                body: JSON.stringify({ tenant_id, unit_id, amount_paid, payment_month, payment_date, reference, late_fee: 0.0, status: "Cleared" })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to record payment');
            }

            closeModal('payment-modal');
            showToast('Bank payment recorded successfully!');
            refreshCurrentTab();
        } catch (err) {
            alert(err.message);
        }
    });

    // Edit Payment Submit (authorized)
    document.getElementById('edit-payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-pay-id').value;
        const tenant_id = parseInt(document.getElementById('edit-pay-tenant-id').value);
        const unit_id = document.getElementById('edit-pay-unit-id').value;
        const amount_paid = parseFloat(document.getElementById('edit-pay-amount').value);
        const payment_month = document.getElementById('edit-pay-month').value;
        const payment_date = document.getElementById('edit-pay-date').value;
        const reference = document.getElementById('edit-pay-reference').value;
        const late_fee = parseFloat(document.getElementById('edit-pay-late-fee').value);
        const status = document.getElementById('edit-pay-status').value;

        try {
            const res = await fetch(`${API_URL}/api/payments/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.currentUser?.token}`
                },
                body: JSON.stringify({ tenant_id, unit_id, amount_paid, payment_month, payment_date, late_fee, reference, status })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to update payment');
            }

            closeModal('edit-payment-modal');
            showToast('Bank payment updated successfully!');
            refreshCurrentTab();
        } catch (err) {
            alert(err.message);
        }
    });

    // Listen to changes in payment date for late fee warnings
    document.getElementById('pay-date').addEventListener('change', (e) => {
        const paymentDateVal = e.target.value;
        if (!paymentDateVal) return;
        
        const date = new Date(paymentDateVal);
        const day = date.getDate();
        const rentRate = parseFloat(document.getElementById('pay-rent-rate').value.replace(/[^0-9]/g, ''));
        const warningEl = document.getElementById('pay-late-fee-warning');
        const warningAmt = document.getElementById('pay-late-fee-amt');

        if (day > 10) {
            const fee = rentRate * 0.05;
            warningAmt.textContent = fee.toLocaleString();
            warningEl.style.display = 'flex';
        } else {
            warningEl.style.display = 'none';
        }
    });

    // Install Tenant Submit (authorized)
    document.getElementById('tenant-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const unit_id = document.getElementById('tenant-unit-id').value;
        const first_name = document.getElementById('tenant-first-name').value;
        const last_name = document.getElementById('tenant-last-name').value;
        const phone = document.getElementById('tenant-phone').value;
        const whatsapp = document.getElementById('tenant-whatsapp').value;
        const move_in_date = document.getElementById('tenant-move-in').value;

        try {
            const res = await fetch(`${API_URL}/api/tenants`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.currentUser?.token}`
                },
                body: JSON.stringify({ unit_id, first_name, last_name, phone, whatsapp, email: '', move_in_date })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to install tenant');
            }

            closeModal('tenant-modal');
            showToast('Tenant successfully installed!');
            refreshCurrentTab();
        } catch (err) {
            alert(err.message);
        }
    });

    // Arrears Form Submit
    document.getElementById('arrears-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const tenantId = parseInt(document.getElementById('arrears-tenant-id').value);
        const arrears = parseFloat(document.getElementById('arrears-amount').value);
        if (isNaN(arrears)) {
            showToast('Please enter a valid amount', 'error');
            return;
        }
        closeModal('arrears-modal');
        await updateTenantArrears(tenantId, arrears);
    });

    // Log Repair button
    document.getElementById('btn-open-repair-modal').addEventListener('click', () => {
        const select = document.getElementById('repair-unit-id');
        select.innerHTML = '<option value="">Common Areas / General</option>';
        state.units.forEach(u => {
            select.innerHTML += `<option value="${u.id}">Unit ${u.id} (${u.side})</option>`;
        });
        openModal('repair-modal');
    });

    // Record Repair Submit (authorized)
    document.getElementById('repair-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const unit_id = document.getElementById('repair-unit-id').value;
        const description = document.getElementById('repair-description').value;
        const cost = parseFloat(document.getElementById('repair-cost').value);
        const priority = document.getElementById('repair-priority').value;

        try {
            const res = await fetch(`${API_URL}/api/repairs`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.currentUser?.token}`
                },
                body: JSON.stringify({ unit_id: unit_id || null, description, cost, priority })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to record repair');
            }

            closeModal('repair-modal');
            showToast('Repair request logged successfully!');
            refreshCurrentTab();
        } catch (err) {
            alert(err.message);
        }
    });

    // Profile photo file uploader
    const picInput = document.getElementById('profile-pic-input');
    if (picInput) {
        picInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Check size < 2MB
            if (file.size > 2 * 1024 * 1024) {
                alert("Profile image size must be less than 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (evt) => {
                const base64 = evt.target.result;
                const img = document.getElementById('profile-pic-preview');
                const placeholder = document.getElementById('profile-pic-placeholder');
                
                img.src = base64;
                img.style.display = 'block';
                placeholder.style.display = 'none';
                
                state.tempAvatarBase64 = base64;
            };
            reader.readAsDataURL(file);
        });
    }

    // Profile Form submit (authorized)
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newUsername = document.getElementById('profile-username').value.trim().toLowerCase();
            const name = document.getElementById('profile-name').value;
            const phone = document.getElementById('profile-phone').value;
            const email = document.getElementById('profile-email').value;
            const avatar = state.tempAvatarBase64 || '';
            const password = document.getElementById('profile-password').value;
            const confirmPassword = document.getElementById('profile-confirm-password').value;
            const oldUsername = state.currentUser.username;

            // Password confirmation check
            if (password || confirmPassword) {
                if (password !== confirmPassword) {
                    showToast("Passwords do not match!", "error");
                    return;
                }
            }

            try {
                const res = await fetch(`${API_URL}/api/owners/${oldUsername}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${state.currentUser?.token}`
                    },
                    body: JSON.stringify({ 
                        username: newUsername, 
                        name, 
                        phone, 
                        email, 
                        avatar,
                        password: password || null
                    })
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.detail || 'Failed to save profile');
                }

                // Update current user details cached state
                state.currentUser.username = newUsername;
                state.currentUser.name = name;
                state.currentUser.phone = phone;
                state.currentUser.email = email;
                state.currentUser.avatar = avatar;
                localStorage.setItem('weena_user', JSON.stringify(state.currentUser));

                // Clear password inputs
                document.getElementById('profile-password').value = '';
                document.getElementById('profile-confirm-password').value = '';

                // Update UI avatar elements
                updateUIWithUserAvatar();
                showToast('Owner profile details updated successfully!');
            } catch (err) {
                alert(err.message);
            }
        });
    }
}

// Switch tabs and load corresponding details
function switchTab(tabId) {
    state.activeTab = tabId;
    
    // Navigation highlight
    document.querySelectorAll('.nav-link').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Tab pane display
    document.querySelectorAll('.tab-pane').forEach(pane => {
        if (pane.id === tabId) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });

    // Fetch tab-specific data
    fetchTabData(tabId);
}

function refreshCurrentTab() {
    fetchTabData(state.activeTab);
}

async function fetchTabData(tabId) {
    if (tabId === 'tab-dashboard') {
        await loadDashboard();
    } else if (tabId === 'tab-units') {
        await loadUnitsData();
        renderUnits('all');
    } else if (tabId === 'tab-tenants') {
        await loadTenantsData();
    } else if (tabId === 'tab-repairs') {
        await loadUnitsData(); // Need it for selecting units in repair modal
        await loadRepairsData();
    } else if (tabId === 'tab-reminders') {
        await loadRemindersData();
    } else if (tabId === 'tab-profile') {
        await loadProfileData();
    }
}

// Stats / Dashboard Load (authorized)
async function loadDashboard() {
    try {
        const res = await fetch(`${API_URL}/api/dashboard/stats?_=${new Date().getTime()}`, {
            headers: {
                'Authorization': `Bearer ${state.currentUser?.token}`
            }
        });
        
        if (res.status === 401) {
            logoutSession();
            return;
        }

        const data = await res.json();
        
        document.getElementById('stats-collected').textContent = `KES ${data.total_collected.toLocaleString()}`;
        document.getElementById('stats-expected-desc').textContent = `Out of KES ${data.total_expected.toLocaleString()} expected`;
        
        // Render arrears with green styling if negative (representing credit)
        const arrearsEl = document.getElementById('stats-arrears');
        arrearsEl.textContent = `KES ${Math.abs(data.arrears).toLocaleString()}`;
        if (data.arrears < 0) {
            arrearsEl.style.color = '#2a9d8f'; // Teal green for credit
            document.getElementById('stats-arrears-desc').textContent = 'Credit Balance (Prepaid)';
        } else {
            arrearsEl.style.color = ''; // Default style
            document.getElementById('stats-arrears-desc').textContent = 'Total Outstanding Arrears';
        }
        
        document.getElementById('stats-tax').textContent = `KES ${data.tax_due.toLocaleString()}`;
        
        // Show/hide mark paid button based on tax status
        const markPaidBtn = document.getElementById('btn-mark-tax-paid');
        const paidBadge = document.getElementById('tax-paid-badge');
        if (data.tax_status === 'Paid') {
            markPaidBtn.style.display = 'none';
            paidBadge.style.display = 'inline-block';
        } else {
            markPaidBtn.style.display = 'inline-block';
            paidBadge.style.display = 'none';
        }
        
        document.getElementById('stats-occupancy').textContent = `${data.occupied_units} / 14`;
        document.getElementById('stats-vacant-desc').textContent = `${data.vacant_units} vacant units`;

        const tbody = document.getElementById('recent-payments-tbody');
        tbody.innerHTML = '';
        if (data.recent_payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No payments logged for this month yet.</td></tr>';
        } else {
            data.recent_payments.forEach(p => {
                const expected = p.expected_rent || 0;
                const remaining = expected > 0 ? Math.max(0, expected - p.amount_paid) : 0;
                const remainingHtml = remaining > 0 
                    ? `<span style="color: var(--danger); font-weight: 600;">KES ${remaining.toLocaleString()}</span>`
                    : `<span class="badge badge-success">Paid</span>`;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                        <td class="col-select-pay" style="display:none;"><input type="checkbox" class="pay-select-cb" data-pay-id="${p.id}"></td>
                        <td><strong>${p.tenant_name}</strong></td>
                        <td><span class="badge badge-neutral">${p.unit_id}</span></td>
                        <td>KES ${p.amount_paid.toLocaleString()}</td>
                        <td>${remainingHtml}</td>
                        <td><code>${p.reference}</code></td>
                        <td>${p.payment_date}</td>
                        <td>${p.late_fee > 0 ? `<span class="badge badge-danger">KES ${p.late_fee.toLocaleString()}</span>` : '<span class="badge badge-success">On Time</span>'}</td>
                        <td>
                            <button class="btn btn-secondary btn-sm btn-edit-pay" style="padding: 4px 8px; font-size: 0.8rem;"><i class="fa-solid fa-edit"></i></button>
                        </td>
                `;
                // Attach edit handler
                tr.querySelector('.btn-edit-pay').addEventListener('click', () => {
                    openEditPaymentModal(p.id, p.tenant_id, p.tenant_name, p.unit_id, p.amount_paid, p.payment_month, p.payment_date, p.late_fee, p.reference, p.status);
                });
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        showToast('Error loading stats');
    }
}

// Fetch Units Data (authorized)
async function loadUnitsData() {
    try {
        const res = await fetch(`${API_URL}/api/units`, {
            headers: {
                'Authorization': `Bearer ${state.currentUser?.token}`
            }
        });
        if (res.status === 401) {
            logoutSession();
            return;
        }
        state.units = await res.json();
    } catch (err) {
        showToast('Error loading units');
    }
}

// Render Units by filter
function renderUnits(filter) {
    const container = document.getElementById('units-container');
    container.innerHTML = '';
    
    const filteredUnits = state.units.filter(u => filter === 'all' || u.side === filter);
    const isEvictMode = state.evictMode || false;

    filteredUnits.forEach(u => {
        let statusClass = 'status-vacant';
        let statusLabel = 'Vacant';

        if (u.status === 'Occupied') {
            statusClass = 'status-occupied';
            statusLabel = 'Occupied';
        }

        const card = document.createElement('div');
        card.className = `unit-card ${statusClass}`;
        card.style.position = 'relative';
        card.innerHTML = `
            ${(isEvictMode && u.status === 'Occupied') ? `<input type="checkbox" class="evict-select-cb" data-tenant-id="${u.tenant_id}" data-unit-id="${u.id}" style="position:absolute; top:12px; right:12px; width:20px; height:20px; accent-color: var(--danger); z-index:10; cursor:pointer;">` : ''}
            <div class="unit-card-header">
                <span class="unit-card-number">${u.id}</span>
                <span class="badge ${u.status === 'Occupied' ? 'badge-success' : 'badge-info'}">${statusLabel}</span>
            </div>
            <div class="unit-card-rent">KES ${u.rent.toLocaleString()}</div>
            <div class="unit-card-side"><i class="fa-solid fa-layer-group"></i> ${u.side}</div>
            <div class="unit-card-tenant">
                <i class="fa-solid fa-user"></i> ${u.tenant_name ? u.tenant_name : 'No Tenant Installed'}
            </div>
        `;

        // Only attach click-to-open-modal if NOT in evict mode
        if (!isEvictMode) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                if (u.status === 'Occupied') {
                    openPaymentModal(u.tenant_id, u.id, u.tenant_name, u.rent);
                } else {
                    openTenantModal(u.id, u.rent);
                }
            });
        }

        container.appendChild(card);
    });
}

// Fetch Tenants Data (authorized)
async function loadTenantsData() {
    try {
        const res = await fetch(`${API_URL}/api/tenants`, {
            headers: {
                'Authorization': `Bearer ${state.currentUser?.token}`
            }
        });
        if (res.status === 401) {
            logoutSession();
            return;
        }
        state.tenants = await res.json();

        const tbody = document.getElementById('tenants-tbody');
        tbody.innerHTML = '';
        if (state.tenants.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No tenants installed yet.</td></tr>';
        } else {
            state.tenants.forEach(t => {
                const waPhone = formatWhatsAppNumber(t.whatsapp);
                const whatsappUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
                    `Dear ${t.first_name}, please note your rent payment bank details for Weena Loft:\n` +
                    `Landlords: Osanya F and Osiko R\n` +
                    `Bank: Absa Bank Queensway\n` +
                    `Acc. 2053 9252 54\n` +
                    `Paybill: 303030\n` +
                    `Rent: KES ${t.rent.toLocaleString()}\n` +
                    `Strictly no M-Pesa. Thank you!\n\n` +
                    `For any Inquiries, contact Operations manager: 0712522925`
                )}`;

                const whatsappUrl7th = `https://wa.me/${waPhone}?text=${encodeURIComponent(
                    `Dear ${t.first_name}, a polite reminder that rent is due by the 10th. Please note that after the 10th, a 5% late fee will be added to the rent cost. Thank you!`
                )}`;

                const arrears = t.arrears || 0;
                let arrearsClass = 'color: var(--text-muted);';
                let arrearsText = `KES ${arrears.toLocaleString()}`;
                
                if (arrears > 0) {
                    arrearsClass = 'color: var(--danger); font-weight: 700;';
                } else if (arrears < 0) {
                    arrearsClass = 'color: #2a9d8f; font-weight: 700;'; // Teal green for credit
                    arrearsText = `KES ${Math.abs(arrears).toLocaleString()} (Credit)`;
                }

                tbody.innerHTML += `
                    <tr>
                        <td><strong>${t.first_name} ${t.last_name}</strong></td>
                        <td><span class="badge badge-neutral">${t.unit_id}</span></td>
                        <td>KES ${t.rent.toLocaleString()}</td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <span style="${arrearsClass}">${arrearsText}</span>
                                <button class="btn-icon" onclick="openArrearsEdit(${t.id}, '${t.first_name} ${t.last_name}', ${arrears})" title="Edit Arrears" style="font-size: 0.75rem;"><i class="fa-solid fa-pen"></i></button>
                            </div>
                        </td>
                        <td>${t.phone}</td>
                        <td>
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <a href="${whatsappUrl}" target="_blank" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem; text-align: center;">
                                    <i class="fa-brands fa-whatsapp text-success"></i> Send 1st
                                </a>
                                <a href="${whatsappUrl7th}" target="_blank" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem; text-align: center;">
                                    <i class="fa-brands fa-whatsapp text-warning"></i> Send 7th
                                </a>
                            </div>
                        </td>
                        <td>${t.move_in_date}</td>
                        <td>
                            <div class="repair-actions">
                                <button class="btn-icon" onclick="copyInstructions('${t.first_name}', ${t.rent})" title="Copy Instructions"><i class="fa-solid fa-copy"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        showToast('Error loading tenants');
    }
}

// Edit tenant arrears - opens modal
function openArrearsEdit(tenantId, tenantName, currentArrears) {
    document.getElementById('arrears-tenant-id').value = tenantId;
    document.getElementById('arrears-tenant-name').value = tenantName;
    document.getElementById('arrears-amount').value = currentArrears;
    openModal('arrears-modal');
}

// Update tenant arrears (authorized)
async function updateTenantArrears(tenantId, arrears) {
    try {
        const res = await fetch(`${API_URL}/api/tenants/${tenantId}/arrears`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.currentUser?.token}`
            },
            body: JSON.stringify({ arrears })
        });
        if (!res.ok) throw new Error('Failed to update arrears');
        showToast('Arrears updated successfully!');
        await loadTenantsData();
        await loadDashboard();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Fetch Repairs Data (authorized)
async function loadRepairsData() {
    try {
        const res = await fetch(`${API_URL}/api/repairs`, {
            headers: {
                'Authorization': `Bearer ${state.currentUser?.token}`
            }
        });
        if (res.status === 401) {
            logoutSession();
            return;
        }
        state.repairs = await res.json();
        
        const reportedCol = document.getElementById('repairs-reported');
        const progressCol = document.getElementById('repairs-progress');
        const completedCol = document.getElementById('repairs-completed');
        
        reportedCol.innerHTML = '';
        progressCol.innerHTML = '';
        completedCol.innerHTML = '';

        state.repairs.forEach(r => {
            const cardHtml = `
                <div class="repair-card">
                    <div class="repair-meta">
                        <span class="repair-unit"><i class="fa-solid fa-door-closed"></i> ${r.unit_id ? `Unit ${r.unit_id}` : 'Common Area'}</span>
                        <span class="badge ${getPriorityBadge(r.priority)}">${r.priority}</span>
                    </div>
                    <p class="repair-desc">${r.description}</p>
                    <div class="repair-footer">
                        <span class="repair-cost">KES ${r.cost.toLocaleString()}</span>
                        <div class="repair-actions">
                            ${r.status === 'Reported' ? `<button class="btn-icon" onclick="updateRepair(${r.id}, 'In Progress')" title="Move to In Progress"><i class="fa-solid fa-arrow-right"></i></button>` : ''}
                            ${r.status === 'In Progress' ? `<button class="btn-icon" onclick="updateRepair(${r.id}, 'Completed')" title="Complete Repair"><i class="fa-solid fa-check text-success"></i></button>` : ''}
                        </div>
                    </div>
                </div>
            `;

            if (r.status === 'Reported') reportedCol.innerHTML += cardHtml;
            else if (r.status === 'In Progress') progressCol.innerHTML += cardHtml;
            else if (r.status === 'Completed') completedCol.innerHTML += cardHtml;
        });

    } catch (err) {
        showToast('Error loading repairs');
    }
}

function getPriorityBadge(priority) {
    if (priority === 'Emergency') return 'badge-danger';
    if (priority === 'High') return 'badge-warning';
    if (priority === 'Medium') return 'badge-info';
    return 'badge-neutral';
}

// Update repair status (authorized)
async function updateRepair(id, newStatus) {
    try {
        const res = await fetch(`${API_URL}/api/repairs/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.currentUser?.token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) throw new Error('Failed to update repair status');
        showToast(`Repair status moved to ${newStatus}`);
        loadRepairsData();
    } catch (err) {
        alert(err.message);
    }
}

// Fetch Reminders data (authorized)
async function loadRemindersData() {
    try {
        const res = await fetch(`${API_URL}/api/reminders`, {
            headers: {
                'Authorization': `Bearer ${state.currentUser?.token}`
            }
        });
        if (res.status === 401) {
            logoutSession();
            return;
        }
        state.reminders = await res.json();

        const tbody = document.getElementById('reminders-tbody');
        tbody.innerHTML = '';
        if (state.reminders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No reminders logged yet.</td></tr>';
        } else {
            state.reminders.forEach(r => {
                tbody.innerHTML += `
                    <tr>
                        <td><span class="badge ${r.type === 'tax_alert' ? 'badge-warning' : 'badge-info'}">${r.type.replace('_', ' ')}</span></td>
                        <td><strong>${r.recipient_name}</strong></td>
                        <td><code>${r.contact}</code></td>
                        <td>${r.message}</td>
                        <td>${r.schedule_date}</td>
                        <td><span class="badge badge-success">${r.status}</span></td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        showToast('Error loading reminders');
    }
}

// Trigger broadcast calls (authorized)
async function triggerBroadcast(endpoint, successMessage) {
    try {
        const res = await fetch(`${API_URL}${endpoint}`, { 
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.currentUser?.token}`
            }
        });
        if (!res.ok) throw new Error('Failed to trigger broadcast');
        showToast(successMessage);
        if (state.activeTab === 'tab-reminders') loadRemindersData();
        else if (state.activeTab === 'tab-dashboard') loadDashboard();
    } catch (err) {
        alert(err.message);
    }
}


// Copy payment instructions to clipboard
function copyInstructions(name, rent) {
    const text = 
        `Dear ${name},\n` +
        `Please note your rent payment bank details for Weena Loft:\n` +
        `Landlords: Osanya F and Osiko R\n` +
        `Bank: Absa Bank Queensway\n` +
        `Acc. 2053 9252 54\n` +
        `Paybill: 303030\n` +
        `Rent Amount: KES ${rent.toLocaleString()}\n` +
        `NOTE: We need money banked, no M-Pesa payments directly to phone numbers. Thank you.`;

    navigator.clipboard.writeText(text).then(() => {
        showToast('Payment instructions copied to clipboard!');
    }).catch(err => {
        alert('Could not copy to clipboard. Please select and copy manually.');
    });
}

// Modals Open/Close Helper
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Specific modals triggering
function openTenantModal(unitId, rent) {
    document.getElementById('tenant-unit-id').value = unitId;
    document.getElementById('tenant-unit-display').value = `Unit ${unitId} (Rent: KES ${rent.toLocaleString()})`;
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tenant-move-in').value = today;

    // Reset fields
    document.getElementById('tenant-first-name').value = '';
    document.getElementById('tenant-last-name').value = '';
    document.getElementById('tenant-phone').value = '';
    document.getElementById('tenant-whatsapp').value = '';

    openModal('tenant-modal');
}

function openPaymentModal(tenantId, unitId, tenantName, rent) {
    document.getElementById('pay-tenant-id').value = tenantId;
    document.getElementById('pay-unit-id').value = unitId;
    document.getElementById('pay-unit-display').value = `Unit ${unitId}`;
    document.getElementById('pay-tenant-name').value = tenantName;
    document.getElementById('pay-rent-rate').value = `KES ${rent.toLocaleString()}`;
    
    // Set defaults
    const todayDate = new Date();
    const todayStr = todayDate.toISOString().split('T')[0];
    const currentMonth = todayDate.toISOString().substring(0, 7);
    
    document.getElementById('pay-date').value = todayStr;
    document.getElementById('pay-month').value = currentMonth;
    document.getElementById('pay-amount').value = rent;
    document.getElementById('pay-reference').value = '';
    document.getElementById('pay-late-fee-warning').style.display = 'none';

    // Check if current day is late (after 10th)
    const day = todayDate.getDate();
    if (day > 10) {
        const fee = rent * 0.05;
        document.getElementById('pay-late-fee-amt').textContent = fee.toLocaleString();
        document.getElementById('pay-late-fee-warning').style.display = 'flex';
    }

    openModal('payment-modal');
}

// Toast Notifier Helper
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
    
    if (type === 'error') {
        toast.style.background = 'linear-gradient(135deg, #d90429 0%, #ef233c 100%)';
    } else {
        toast.style.background = 'linear-gradient(135deg, var(--primary) 0%, #5a189a 100%)';
    }
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// Avatar rendering helper
function updateUIWithUserAvatar() {
    const user = state.currentUser;
    if (!user) return;

    const initials = user.name.split(' ').map(n => n[0]).join('');
    const avatarHtml = user.avatar ? `<img src="${user.avatar}" alt="Avatar">` : initials;

    // Header avatar
    const headerAvatar = document.getElementById('user-avatar-initials');
    if (headerAvatar) {
        headerAvatar.innerHTML = avatarHtml;
        headerAvatar.style.background = user.avatar ? 'none' : 'linear-gradient(135deg, #7b2cbf 0%, var(--primary) 100%)';
    }

    // Mobile Menu avatar
    const mobileAvatar = document.getElementById('mobile-user-avatar-initials');
    if (mobileAvatar) {
        mobileAvatar.innerHTML = avatarHtml;
        mobileAvatar.style.background = user.avatar ? 'none' : 'linear-gradient(135deg, #7b2cbf 0%, var(--primary) 100%)';
    }

    // Welcome dialog avatar
    const welcomeAvatar = document.getElementById('welcome-avatar');
    if (welcomeAvatar && user.avatar) {
        welcomeAvatar.innerHTML = `<img src="${user.avatar}" alt="Avatar">`;
        welcomeAvatar.style.background = 'none';
        welcomeAvatar.style.boxShadow = 'none';
    }

    // Update display text values
    document.getElementById('user-display-name').textContent = user.name;
    document.getElementById('mobile-user-display-name').textContent = user.name;
}

// Load Profile settings (authorized)
async function loadProfileData() {
    try {
        const res = await fetch(`${API_URL}/api/owners/${state.currentUser.username}`, {
            headers: {
                'Authorization': `Bearer ${state.currentUser?.token}`
            }
        });
        if (res.status === 401) {
            logoutSession();
            return;
        }
        if (!res.ok) throw new Error('Failed to load profile data');
        const data = await res.json();

        // Fill form fields
        document.getElementById('profile-username').value = data.username;
        document.getElementById('profile-role').value = data.role;
        document.getElementById('profile-name').value = data.name;
        document.getElementById('profile-phone').value = data.phone;
        document.getElementById('profile-email').value = data.email;

        // Render profile picture preview
        const img = document.getElementById('profile-pic-preview');
        const placeholder = document.getElementById('profile-pic-placeholder');
        if (data.avatar) {
            img.src = data.avatar;
            img.style.display = 'block';
            placeholder.style.display = 'none';
            state.tempAvatarBase64 = data.avatar;
        } else {
            img.style.display = 'none';
            placeholder.style.display = 'flex';
            state.tempAvatarBase64 = '';
        }
    } catch (err) {
        showToast(err.message);
    }
}

// Global password visibility toggle
function togglePasswordVisibility(inputId, toggleEl) {
    const input = document.getElementById(inputId);
    const icon = toggleEl.querySelector('i');
    if (input && icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

// --- Bulk WhatsApp Logic ---
function startBulkWhatsApp(type) {
    bulkDateType = type;
    
    let targetQueue = [];
    
    if (type === 'tax') {
        // Target owners for tax reminders
        const owners = [
            { first_name: 'Florence', last_name: 'Osanya', whatsapp: '0721470131', rent: 0 },
            { first_name: 'Ralph', last_name: 'Osiko', whatsapp: '0712522925', rent: 0 }
        ];
        
        bulkQueue = owners.map(owner => {
            const text = `Dear ${owner.first_name}, this is your automated Weena Loft Tax Reminder. Please note that the 7.5% monthly tax computation is due. Ensure collections are updated before the 10th deadline.`;
            const waPhone = formatWhatsAppNumber(owner.whatsapp);
            const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`;
            return { tenant: owner, url: url };
        });
        
    } else {
        // Target active tenants for rent/bank/late reminders
        const activeTenants = state.tenants.filter(t => t.status === 'Active');
        
        if (activeTenants.length === 0) {
            showToast("No active tenants to send to.");
            return;
        }

        bulkQueue = activeTenants.map(t => {
            let text = "";
            if (type === 'rent' || type === 'absa') {
                text = `Dear ${t.first_name}, please note your rent payment bank details for Weena Loft:\n` +
                       `Landlords: Osanya F and Osiko R\n` +
                       `Bank: Absa Bank Queensway\n` +
                       `Acc. 2053 9252 54\n` +
                       `Paybill: 303030\n` +
                       `Rent: KES ${t.rent.toLocaleString()}\n` +
                       `Pay via Paybill to Bank only. No direct Send Money. Thank you!\n\n` +
                       `For any Inquiries, contact Operations manager: 0712522925`;
            } else if (type === '7th') {
                text = `Dear ${t.first_name}, a polite reminder that rent is due by the 10th. Please note that after the 10th, a 5% late fee will be added to the rent cost. Thank you!`;
            }
            const waPhone = formatWhatsAppNumber(t.whatsapp);
            const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`;
            return { tenant: t, url: url };
        });
    }

    bulkCurrentIndex = 0;
    document.getElementById('bulk-whatsapp-modal').style.display = 'flex';
    renderBulkModal();
}

function renderBulkModal() {
    if (bulkCurrentIndex >= bulkQueue.length) {
        closeBulkModal();
        showToast("All tenants processed!");
        return;
    }

    const current = bulkQueue[bulkCurrentIndex];
    const progressText = document.getElementById('bulk-progress-text');
    const progressFill = document.getElementById('bulk-progress-fill');
    const nameEl = document.getElementById('bulk-current-tenant');
    const rentEl = document.getElementById('bulk-current-rent');
    const sendBtn = document.getElementById('bulk-send-btn');

    progressText.textContent = `Queue: ${bulkCurrentIndex + 1} of ${bulkQueue.length}`;
    progressFill.style.width = `${((bulkCurrentIndex) / bulkQueue.length) * 100}%`;
    nameEl.textContent = `Tenant: ${current.tenant.first_name} ${current.tenant.last_name}`;
    rentEl.textContent = current.tenant.rent.toLocaleString();
    sendBtn.href = current.url;
}

function markSentAndProceed() {
    // Wait a brief moment for the tab to open, then advance
    setTimeout(() => {
        bulkCurrentIndex++;
        renderBulkModal();
    }, 500);
}

function nextBulkTenant() {
    bulkCurrentIndex++;
    renderBulkModal();
}

function closeBulkModal() {
    document.getElementById('bulk-whatsapp-modal').style.display = 'none';
}

// Edit & Delete Payment Actions (authorized)
function openEditPaymentModal(id, tenantId, tenantName, unitId, amount, month, date, lateFee, reference, status) {
    document.getElementById('edit-pay-id').value = id;
    document.getElementById('edit-pay-tenant-id').value = tenantId;
    document.getElementById('edit-pay-unit-id').value = unitId;
    document.getElementById('edit-pay-unit-display').value = `Unit ${unitId}`;
    document.getElementById('edit-pay-tenant-name').value = tenantName;
    document.getElementById('edit-pay-amount').value = amount;
    document.getElementById('edit-pay-month').value = month;
    document.getElementById('edit-pay-date').value = date;
    document.getElementById('edit-pay-reference').value = reference;
    document.getElementById('edit-pay-late-fee').value = lateFee;
    document.getElementById('edit-pay-status').value = status;
    openModal('edit-payment-modal');
}

async function deletePayment(paymentId) {
    if (!confirm('Are you sure you want to delete this payment record? This will revert any calculated arrears.')) {
        return;
    }
    try {
        const res = await fetch(`${API_URL}/api/payments/${paymentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${state.currentUser?.token}`
            }
        });
        if (res.status === 401) {
            logoutSession();
            return;
        }
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to delete payment');
        }
        showToast('Payment record deleted successfully!');
        refreshCurrentTab();
    } catch (err) {
        alert(err.message);
    }
}

async function markTaxPaid() {
    if (!confirm('Are you sure you want to mark this month\'s tax as Paid?')) {
        return;
    }
    try {
        const res = await fetch(`${API_URL}/api/dashboard/mark-tax-paid`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.currentUser?.token}`
            }
        });
        if (res.status === 401) {
            logoutSession();
            return;
        }
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to update tax status');
        }
        showToast('Monthly tax obligation marked as Paid!');
        refreshCurrentTab();
    } catch (err) {
        alert(err.message);
    }
}
