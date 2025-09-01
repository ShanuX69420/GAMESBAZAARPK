// Global state
let currentEditingId = null;
let currentEditingType = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardStats();
});

// Tab Management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Load data for the selected tab
    switch(tabName) {
        case 'users':
            loadUsers();
            break;
        case 'games':
            loadGames();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'listings':
            loadListings();
            break;
    }
}

// Dashboard Stats
async function loadDashboardStats() {
    try {
        const [usersRes, gamesRes, categoriesRes, listingsRes] = await Promise.all([
            fetch('/admin/api/users'),
            fetch('/admin/api/games'),
            fetch('/admin/api/categories'),
            fetch('/admin/api/listings')
        ]);
        
        const users = await usersRes.json();
        const games = await gamesRes.json();
        const categories = await categoriesRes.json();
        const listings = await listingsRes.json();
        
        document.getElementById('stats-users').textContent = users.pagination?.total || users.data?.length || 0;
        document.getElementById('stats-games').textContent = games.pagination?.total || games.data?.length || 0;
        document.getElementById('stats-categories').textContent = categories.data?.length || 0;
        document.getElementById('stats-listings').textContent = listings.pagination?.total || listings.data?.length || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Users Management
async function loadUsers(page = 1, limit = 25) {
    const content = document.getElementById('users-content');
    content.innerHTML = '<div class="loading">Loading users...</div>';
    
    try {
        const response = await fetch(`/admin/api/users?page=${page}&limit=${limit}`);
        const data = await response.json();
        
        if (data.error) {
            content.innerHTML = `<div class="alert alert-danger">Error: ${data.error}</div>`;
            return;
        }
        
        let html = '<table class="data-table"><thead><tr>';
        html += '<th>Username</th><th>Email</th><th>Name</th><th>Role</th><th>Created</th><th>Actions</th>';
        html += '</tr></thead><tbody>';
        
        data.data.forEach(user => {
            html += `<tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.name || '-'}</td>
                <td><span class="badge badge-${user.role.toLowerCase()}">${user.role}</span></td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-warning btn-small" onclick="editUser('${user.id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteUser('${user.id}', '${user.username}')">Delete</button>
                </td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        
        if (data.pagination) {
            html += `<div style="margin-top: 1rem; color: #6c757d; font-size: 0.9rem;">
                Showing page ${data.pagination.page} of ${data.pagination.totalPages} (${data.pagination.total} total)
            </div>`;
        }
        
        content.innerHTML = html;
    } catch (error) {
        content.innerHTML = '<div class="alert alert-danger">Failed to load users</div>';
    }
}

// Games Management
async function loadGames(page = 1, limit = 50) {
    const content = document.getElementById('games-content');
    content.innerHTML = '<div class="loading">Loading games...</div>';
    
    try {
        const response = await fetch(`/admin/api/games?page=${page}&limit=${limit}`);
        const data = await response.json();
        
        if (data.error) {
            content.innerHTML = `<div class="alert alert-danger">Error: ${data.error}</div>`;
            return;
        }
        
        let html = '<table class="data-table"><thead><tr>';
        html += '<th>Name</th><th>Slug</th><th>Description</th><th>Listings</th><th>Created</th><th>Actions</th>';
        html += '</tr></thead><tbody>';
        
        data.data.forEach(game => {
            html += `<tr>
                <td><strong>${game.name}</strong></td>
                <td><code>${game.slug}</code></td>
                <td>${game.description ? game.description.substring(0, 50) + '...' : '-'}</td>
                <td><span class="badge badge-secondary">${game._count?.listings || 0}</span></td>
                <td>${new Date(game.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-warning btn-small" onclick="editGame('${game.id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteGame('${game.id}', '${game.name}')">Delete</button>
                </td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        
        // Add pagination controls
        if (data.pagination && data.pagination.totalPages > 1) {
            html += '<div class="pagination-controls" style="margin-top: 1rem; text-align: center;">';
            
            // Previous button
            if (data.pagination.page > 1) {
                html += `<button class="btn btn-secondary btn-small" onclick="loadGames(${data.pagination.page - 1}, ${limit})" style="margin: 0 0.25rem;">← Previous</button>`;
            }
            
            // Page numbers
            const currentPage = data.pagination.page;
            const totalPages = data.pagination.totalPages;
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, currentPage + 2);
            
            for (let i = startPage; i <= endPage; i++) {
                const isActive = i === currentPage;
                const btnClass = isActive ? 'btn btn-primary btn-small' : 'btn btn-secondary btn-small';
                html += `<button class="${btnClass}" onclick="loadGames(${i}, ${limit})" style="margin: 0 0.25rem;">${i}</button>`;
            }
            
            // Next button
            if (data.pagination.page < data.pagination.totalPages) {
                html += `<button class="btn btn-secondary btn-small" onclick="loadGames(${data.pagination.page + 1}, ${limit})" style="margin: 0 0.25rem;">Next →</button>`;
            }
            
            html += '</div>';
            html += `<div style="margin-top: 1rem; text-align: center; color: #6c757d; font-size: 0.9rem;">
                Showing ${((data.pagination.page - 1) * data.pagination.limit) + 1}-${Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of ${data.pagination.total} games
            </div>`;
        }
        
        content.innerHTML = html;
    } catch (error) {
        content.innerHTML = '<div class="alert alert-danger">Failed to load games</div>';
    }
}

// Categories Management
async function loadCategories() {
    const content = document.getElementById('categories-content');
    content.innerHTML = '<div class="loading">Loading categories...</div>';
    
    try {
        const response = await fetch('/admin/api/categories');
        const data = await response.json();
        
        if (data.error) {
            content.innerHTML = `<div class="alert alert-danger">Error: ${data.error}</div>`;
            return;
        }
        
        let html = '<table class="data-table"><thead><tr>';
        html += '<th>Icon</th><th>Name</th><th>Slug</th><th>Description</th><th>Games</th><th>Actions</th>';
        html += '</tr></thead><tbody>';
        
        data.data.forEach(category => {
            html += `<tr>
                <td style="font-size: 1.2rem;">${category.icon || '📂'}</td>
                <td><strong>${category.name}</strong></td>
                <td><code>${category.slug}</code></td>
                <td>${category.description || '-'}</td>
                <td><span class="badge badge-secondary">${category._count?.games || 0}</span></td>
                <td>
                    <button class="btn btn-warning btn-small" onclick="editCategory('${category.id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteCategory('${category.id}', '${category.name}')">Delete</button>
                </td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        content.innerHTML = html;
    } catch (error) {
        content.innerHTML = '<div class="alert alert-danger">Failed to load categories</div>';
    }
}

// Listings Management
async function loadListings(page = 1, limit = 25) {
    const content = document.getElementById('listings-content');
    content.innerHTML = '<div class="loading">Loading listings...</div>';
    
    try {
        const response = await fetch(`/admin/api/listings?page=${page}&limit=${limit}`);
        const data = await response.json();
        
        if (data.error) {
            content.innerHTML = `<div class="alert alert-danger">Error: ${data.error}</div>`;
            return;
        }
        
        let html = '<table class="data-table"><thead><tr>';
        html += '<th>Title</th><th>Game</th><th>Seller</th><th>Price</th><th>Type</th><th>Status</th><th>Created</th><th>Actions</th>';
        html += '</tr></thead><tbody>';
        
        data.data.forEach(listing => {
            html += `<tr>
                <td><strong>${listing.title}</strong></td>
                <td>${listing.game?.name || 'N/A'}</td>
                <td>${listing.seller?.username || 'N/A'}</td>
                <td>PKR ${listing.price.toLocaleString()}</td>
                <td><span class="badge badge-secondary">${listing.type}</span></td>
                <td><span class="badge badge-${listing.status.toLowerCase()}">${listing.status}</span></td>
                <td>${new Date(listing.createdAt).toLocaleDateString()}</td>
                <td>
                    <select onchange="updateListingStatus('${listing.id}', this.value)" style="font-size: 0.8rem; padding: 0.2rem;">
                        <option value="ACTIVE" ${listing.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
                        <option value="PAUSED" ${listing.status === 'PAUSED' ? 'selected' : ''}>Paused</option>
                        <option value="SOLD" ${listing.status === 'SOLD' ? 'selected' : ''}>Sold</option>
                        <option value="DELETED" ${listing.status === 'DELETED' ? 'selected' : ''}>Deleted</option>
                    </select>
                    <button class="btn btn-danger btn-small" onclick="deleteListing('${listing.id}', '${listing.title}')">Delete</button>
                </td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        content.innerHTML = html;
    } catch (error) {
        content.innerHTML = '<div class="alert alert-danger">Failed to load listings</div>';
    }
}

// Modal Management
function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    currentEditingId = null;
    currentEditingType = null;
}

// User Forms
function showCreateUserForm() {
    document.getElementById('userModalTitle').textContent = 'Add New User';
    document.getElementById('userForm').reset();
    currentEditingId = null;
    currentEditingType = 'user';
    showModal('userModal');
}

async function editUser(id) {
    try {
        const response = await fetch(`/admin/api/users/${id}`);
        const data = await response.json();
        
        if (data.error) {
            alert('Error loading user data');
            return;
        }
        
        const user = data.data;
        document.getElementById('userModalTitle').textContent = 'Edit User';
        
        const form = document.getElementById('userForm');
        form.username.value = user.username;
        form.email.value = user.email;
        form.name.value = user.name || '';
        form.role.value = user.role;
        form.phoneNumber.value = user.phoneNumber || '';
        form.city.value = user.city || '';
        
        currentEditingId = id;
        currentEditingType = 'user';
        showModal('userModal');
    } catch (error) {
        alert('Error loading user data');
    }
}

// Game Forms
function showCreateGameForm() {
    document.getElementById('gameModalTitle').textContent = 'Add New Game';
    document.getElementById('gameForm').reset();
    currentEditingId = null;
    currentEditingType = 'game';
    showModal('gameModal');
}

async function editGame(id) {
    try {
        const response = await fetch(`/admin/api/games/${id}`);
        const data = await response.json();
        
        if (data.error) {
            alert('Error loading game data');
            return;
        }
        
        const game = data.data;
        document.getElementById('gameModalTitle').textContent = 'Edit Game';
        
        const form = document.getElementById('gameForm');
        form.name.value = game.name;
        form.slug.value = game.slug;
        form.description.value = game.description || '';
        form.image.value = game.image || '';
        
        currentEditingId = id;
        currentEditingType = 'game';
        showModal('gameModal');
    } catch (error) {
        alert('Error loading game data');
    }
}

// Category Forms
function showCreateCategoryForm() {
    document.getElementById('categoryModalTitle').textContent = 'Add New Category';
    document.getElementById('categoryForm').reset();
    currentEditingId = null;
    currentEditingType = 'category';
    showModal('categoryModal');
}

async function editCategory(id) {
    try {
        const response = await fetch(`/admin/api/categories/${id}`);
        const data = await response.json();
        
        if (data.error) {
            alert('Error loading category data');
            return;
        }
        
        const category = data.data;
        document.getElementById('categoryModalTitle').textContent = 'Edit Category';
        
        const form = document.getElementById('categoryForm');
        form.name.value = category.name;
        form.slug.value = category.slug;
        form.description.value = category.description || '';
        form.icon.value = category.icon || '';
        
        currentEditingId = id;
        currentEditingType = 'category';
        showModal('categoryModal');
    } catch (error) {
        alert('Error loading category data');
    }
}

// Form Submissions
document.getElementById('userForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    
    try {
        let response;
        if (currentEditingId) {
            response = await fetch(`/admin/api/users/${currentEditingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // For creating users, we'd need a separate endpoint
            alert('User creation not implemented yet. Please use edit functionality.');
            return;
        }
        
        if (response.ok) {
            closeModal('userModal');
            loadUsers();
            loadDashboardStats();
        } else {
            alert('Error saving user');
        }
    } catch (error) {
        alert('Error saving user');
    }
});

document.getElementById('gameForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    
    try {
        let response;
        if (currentEditingId) {
            response = await fetch(`/admin/api/games/${currentEditingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch('/admin/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        if (response.ok) {
            closeModal('gameModal');
            loadGames();
            loadDashboardStats();
        } else {
            alert('Error saving game');
        }
    } catch (error) {
        alert('Error saving game');
    }
});

document.getElementById('categoryForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    
    try {
        let response;
        if (currentEditingId) {
            response = await fetch(`/admin/api/categories/${currentEditingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch('/admin/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        if (response.ok) {
            closeModal('categoryModal');
            loadCategories();
            loadDashboardStats();
        } else {
            alert('Error saving category');
        }
    } catch (error) {
        alert('Error saving category');
    }
});

// Delete Functions
function deleteUser(id, username) {
    showConfirmation(
        `Are you sure you want to delete user "${username}"? This action cannot be undone.`,
        async () => {
            try {
                const response = await fetch(`/admin/api/users/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    loadUsers();
                    loadDashboardStats();
                } else {
                    alert('Error deleting user');
                }
            } catch (error) {
                alert('Error deleting user');
            }
        }
    );
}

function deleteGame(id, name) {
    showConfirmation(
        `Are you sure you want to delete game "${name}"? This will also delete all associated listings and categories.`,
        async () => {
            try {
                const response = await fetch(`/admin/api/games/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    loadGames();
                    loadDashboardStats();
                } else {
                    alert('Error deleting game');
                }
            } catch (error) {
                alert('Error deleting game');
            }
        }
    );
}

function deleteCategory(id, name) {
    showConfirmation(
        `Are you sure you want to delete category "${name}"?`,
        async () => {
            try {
                const response = await fetch(`/admin/api/categories/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    loadCategories();
                    loadDashboardStats();
                } else {
                    alert('Error deleting category');
                }
            } catch (error) {
                alert('Error deleting category');
            }
        }
    );
}

function deleteListing(id, title) {
    showConfirmation(
        `Are you sure you want to delete listing "${title}"?`,
        async () => {
            try {
                const response = await fetch(`/admin/api/listings/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    loadListings();
                    loadDashboardStats();
                } else {
                    alert('Error deleting listing');
                }
            } catch (error) {
                alert('Error deleting listing');
            }
        }
    );
}

// Update listing status
async function updateListingStatus(id, status) {
    try {
        const response = await fetch(`/admin/api/listings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            loadListings();
        } else {
            alert('Error updating listing status');
        }
    } catch (error) {
        alert('Error updating listing status');
    }
}

// Confirmation Modal
function showConfirmation(message, onConfirm) {
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmBtn').onclick = () => {
        closeModal('confirmModal');
        onConfirm();
    };
    showModal('confirmModal');
}

// Auto-generate slug from name
document.addEventListener('DOMContentLoaded', function() {
    const nameInputs = document.querySelectorAll('input[name="name"]');
    const slugInputs = document.querySelectorAll('input[name="slug"]');
    
    nameInputs.forEach((nameInput, index) => {
        nameInput.addEventListener('input', function() {
            if (slugInputs[index] && !slugInputs[index].value) {
                slugInputs[index].value = this.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
            }
        });
    });
});