import { NextRequest } from 'next/server'
import { authenticate } from '@/lib/admin-auth'
import { prisma } from '@/lib/adminjs-simple'

export async function GET(request: NextRequest, { params }: { params: Promise<{ adminjs?: string[] }> }) {
  // Check authentication
  const authResult = await authenticate(request)
  if (!authResult.success) {
    const url = new URL(authResult.redirectUrl, request.url)
    return Response.redirect(url.toString())
  }

  const resolvedParams = await params
  const path = resolvedParams.adminjs?.join('/') || ''
  
  // Handle API routes
  if (path.startsWith('api/')) {
    return handleApiRequest(request, path)
  }

  // Return the main admin interface
  return new Response(await getAdminHTML(), {
    status: 200,
    headers: {
      'content-type': 'text/html',
    },
  })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ adminjs?: string[] }> }) {
  // Check authentication
  const authResult = await authenticate(request)
  if (!authResult.success) {
    const url = new URL(authResult.redirectUrl, request.url)
    return Response.redirect(url.toString())
  }

  const resolvedParams = await params
  const path = resolvedParams.adminjs?.join('/') || ''
  
  // Handle API routes
  if (path.startsWith('api/')) {
    return handleApiRequest(request, path)
  }

  return new Response('Method not allowed', { status: 405 })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ adminjs?: string[] }> }) {
  // Check authentication
  const authResult = await authenticate(request)
  if (!authResult.success) {
    const url = new URL(authResult.redirectUrl, request.url)
    return Response.redirect(url.toString())
  }

  const resolvedParams = await params
  const path = resolvedParams.adminjs?.join('/') || ''
  
  // Handle API routes
  if (path.startsWith('api/')) {
    return handleApiRequest(request, path)
  }

  return new Response('Method not allowed', { status: 405 })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ adminjs?: string[] }> }) {
  // Check authentication
  const authResult = await authenticate(request)
  if (!authResult.success) {
    const url = new URL(authResult.redirectUrl, request.url)
    return Response.redirect(url.toString())
  }

  const resolvedParams = await params
  const path = resolvedParams.adminjs?.join('/') || ''
  
  // Handle API routes
  if (path.startsWith('api/')) {
    return handleApiRequest(request, path)
  }

  return new Response('Method not allowed', { status: 405 })
}

async function handleApiRequest(request: NextRequest, path: string) {
  const url = new URL(request.url)
  const pathParts = path.split('/').filter(Boolean) // Remove empty strings
  const resource = pathParts[1] // Extract resource name from api/{resource}
  const id = pathParts[2] // Extract ID if present for edit/delete operations
  
  try {
    switch (resource) {
      case 'users':
        return handleUsersApi(request, url, id)
      case 'games':
        return handleGamesApi(request, url, id)
      case 'categories':
        return handleCategoriesApi(request, url, id)
      case 'listings':
        return handleListingsApi(request, url, id)
      default:
        return Response.json({ error: 'Resource not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleUsersApi(request: NextRequest, url: URL, id?: string) {
  if (request.method === 'GET') {
    if (id) {
      // Get single user
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          phoneNumber: true,
          city: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      return Response.json({ data: user })
    }
    
    // Get all users with pagination
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    
    const total = await prisma.user.count()
    
    return Response.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  }

  if (request.method === 'PUT' && id) {
    // Update user
    const body = await request.json()
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username: body.username,
        email: body.email,
        name: body.name,
        role: body.role,
        phoneNumber: body.phoneNumber,
        city: body.city,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        city: true,
      }
    })
    return Response.json({ data: updatedUser })
  }

  if (request.method === 'DELETE' && id) {
    // Delete user
    await prisma.user.delete({
      where: { id }
    })
    return Response.json({ success: true })
  }
  
  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}

async function handleGamesApi(request: NextRequest, url: URL, id?: string) {
  if (request.method === 'GET') {
    if (id) {
      // Get single game
      const game = await prisma.game.findUnique({
        where: { id },
        include: {
          categories: {
            include: {
              category: true
            }
          },
          _count: {
            select: { listings: true }
          }
        },
      })
      return Response.json({ data: game })
    }
    
    // Get all games with pagination
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    const games = await prisma.game.findMany({
      skip,
      take: limit,
      include: {
        categories: {
          include: {
            category: true
          }
        },
        _count: {
          select: { listings: true }
        }
      },
    })
    
    const total = await prisma.game.count()
    
    return Response.json({
      data: games,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  }

  if (request.method === 'POST') {
    // Create new game
    const body = await request.json()
    const newGame = await prisma.game.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        image: body.image,
      },
    })
    
    // Handle category assignments
    if (body.categoryIds && Array.isArray(body.categoryIds)) {
      await prisma.gameCategory.createMany({
        data: body.categoryIds.map((categoryId: string) => ({
          gameId: newGame.id,
          categoryId,
        })),
        skipDuplicates: true,
      })
    }
    
    return Response.json({ data: newGame })
  }

  if (request.method === 'PUT' && id) {
    // Update game
    const body = await request.json()
    const updatedGame = await prisma.game.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        image: body.image,
      },
    })
    
    // Handle category assignments - remove existing and add new ones
    if (body.categoryIds !== undefined) {
      // Remove existing category assignments
      await prisma.gameCategory.deleteMany({
        where: { gameId: id },
      })
      
      // Add new category assignments
      if (Array.isArray(body.categoryIds) && body.categoryIds.length > 0) {
        await prisma.gameCategory.createMany({
          data: body.categoryIds.map((categoryId: string) => ({
            gameId: id,
            categoryId,
          })),
          skipDuplicates: true,
        })
      }
    }
    
    return Response.json({ data: updatedGame })
  }

  if (request.method === 'DELETE' && id) {
    // Delete game (this will also delete related listings and categories due to cascade)
    await prisma.game.delete({
      where: { id }
    })
    return Response.json({ success: true })
  }
  
  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}

async function handleCategoriesApi(request: NextRequest, url: URL, id?: string) {
  if (request.method === 'GET') {
    if (id) {
      // Get single category
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          games: {
            include: {
              game: true
            }
          }
        },
      })
      return Response.json({ data: category })
    }
    
    // Get all categories
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { games: true }
        }
      },
    })
    
    return Response.json({ data: categories })
  }

  if (request.method === 'POST') {
    // Create new category
    const body = await request.json()
    const newCategory = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        icon: body.icon,
      },
    })
    return Response.json({ data: newCategory })
  }

  if (request.method === 'PUT' && id) {
    // Update category
    const body = await request.json()
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        icon: body.icon,
      },
    })
    return Response.json({ data: updatedCategory })
  }

  if (request.method === 'DELETE' && id) {
    // Delete category
    await prisma.category.delete({
      where: { id }
    })
    return Response.json({ success: true })
  }
  
  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}

async function handleListingsApi(request: NextRequest, url: URL, id?: string) {
  if (request.method === 'GET') {
    if (id) {
      // Get single listing
      const listing = await prisma.listing.findUnique({
        where: { id },
        include: {
          game: true,
          seller: { select: { username: true, email: true } },
        },
      })
      return Response.json({ data: listing })
    }
    
    // Get all listings with pagination
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    const listings = await prisma.listing.findMany({
      skip,
      take: limit,
      include: {
        game: { select: { name: true } },
        seller: { select: { username: true } },
      },
    })
    
    const total = await prisma.listing.count()
    
    return Response.json({
      data: listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  }

  if (request.method === 'PUT' && id) {
    // Update listing (mainly for status changes)
    const body = await request.json()
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        status: body.status,
      },
    })
    return Response.json({ data: updatedListing })
  }

  if (request.method === 'DELETE' && id) {
    // Delete listing
    await prisma.listing.delete({
      where: { id }
    })
    return Response.json({ success: true })
  }
  
  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}

async function getAdminHTML() {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pakistani Gaming Marketplace - Admin Panel</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 0; background: #f8f9fa; 
        }
        .header { 
            background: #343a40; color: white; padding: 1rem 2rem; 
            border-bottom: 3px solid #007bff;
        }
        .header h1 { margin: 0; font-size: 1.5rem; }
        .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
        
        /* Navigation Tabs */
        .nav-tabs {
            display: flex;
            margin-bottom: 2rem;
            border-bottom: 2px solid #dee2e6;
        }
        .nav-tab {
            padding: 1rem 2rem;
            background: none;
            border: none;
            border-bottom: 3px solid transparent;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 500;
            color: #495057;
            transition: all 0.2s;
        }
        .nav-tab:hover {
            color: #007bff;
            border-bottom-color: #007bff;
        }
        .nav-tab.active {
            color: #007bff;
            border-bottom-color: #007bff;
        }
        
        /* Content Sections */
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        
        /* Action Buttons */
        .actions {
            margin-bottom: 2rem;
        }
        .btn { 
            display: inline-block; 
            padding: 0.5rem 1rem; 
            background: #007bff; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px; 
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
            margin-right: 0.5rem;
            transition: background 0.2s;
        }
        .btn:hover { background: #0056b3; }
        .btn-success { background: #28a745; }
        .btn-success:hover { background: #218838; }
        .btn-danger { background: #dc3545; }
        .btn-danger:hover { background: #c82333; }
        .btn-warning { background: #ffc107; color: #212529; }
        .btn-warning:hover { background: #e0a800; }
        .btn-secondary { background: #6c757d; }
        .btn-secondary:hover { background: #545b62; }
        .btn-small {
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
        }
        
        /* Data Tables */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .data-table th,
        .data-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        .data-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #495057;
        }
        .data-table tbody tr:hover {
            background: #f8f9fa;
        }
        
        /* Badges */
        .badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        .badge-admin { background: #dc3545; color: white; }
        .badge-seller { background: #ffc107; color: #212529; }
        .badge-user { background: #6c757d; color: white; }
        .badge-active { background: #28a745; color: white; }
        .badge-sold { background: #6c757d; color: white; }
        .badge-paused { background: #ffc107; color: #212529; }
        
        /* Modals */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
        }
        .modal.show {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #dee2e6;
        }
        .modal-header h3 {
            margin: 0;
        }
        .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6c757d;
        }
        .close-btn:hover {
            color: #495057;
        }
        
        /* Forms */
        .form-group {
            margin-bottom: 1rem;
        }
        .form-group label {
            display: block;
            margin-bottom: 0.25rem;
            font-weight: 500;
        }
        .form-control {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-size: 0.9rem;
            box-sizing: border-box;
        }
        .form-control:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        select.form-control {
            height: auto;
        }
        textarea.form-control {
            resize: vertical;
            min-height: 80px;
        }
        
        /* Loading states */
        .loading { 
            text-align: center; 
            padding: 2rem; 
            color: #6c757d; 
        }
        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Alerts */
        .alert {
            padding: 1rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: 4px;
        }
        .alert-success {
            background-color: #d4edda;
            border-color: #c3e6cb;
            color: #155724;
        }
        .alert-danger {
            background-color: #f8d7da;
            border-color: #f5c6cb;
            color: #721c24;
        }
        
        /* Stats Cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-card h3 {
            margin: 0 0 0.5rem 0;
            color: #007bff;
            font-size: 2rem;
        }
        .stat-card p {
            margin: 0;
            color: #6c757d;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            .nav-tabs {
                overflow-x: auto;
            }
            .nav-tab {
                white-space: nowrap;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏪 Pakistani Gaming Marketplace - Admin Panel</h1>
    </div>
    
    <div class="container">
        <!-- Navigation Tabs -->
        <div class="nav-tabs">
            <button class="nav-tab active" onclick="showTab('dashboard')">📊 Dashboard</button>
            <button class="nav-tab" onclick="showTab('users')">👥 Users</button>
            <button class="nav-tab" onclick="showTab('games')">🎮 Games</button>
            <button class="nav-tab" onclick="showTab('categories')">🏷️ Categories</button>
            <button class="nav-tab" onclick="showTab('listings')">🛒 Listings</button>
        </div>
        
        <!-- Dashboard Tab -->
        <div id="dashboard" class="tab-content active">
            <div class="stats-grid">
                <div class="stat-card">
                    <h3 id="stats-users">-</h3>
                    <p>Total Users</p>
                </div>
                <div class="stat-card">
                    <h3 id="stats-games">-</h3>
                    <p>Games</p>
                </div>
                <div class="stat-card">
                    <h3 id="stats-listings">-</h3>
                    <p>Active Listings</p>
                </div>
                <div class="stat-card">
                    <h3 id="stats-categories">-</h3>
                    <p>Categories</p>
                </div>
            </div>
        </div>
        
        <!-- Users Tab -->
        <div id="users" class="tab-content">
            <div id="users-content">
                <div class="loading">Loading users...</div>
            </div>
        </div>
        
        <!-- Games Tab -->
        <div id="games" class="tab-content">
            <div class="actions">
                <button class="btn btn-success" onclick="showCreateGameForm()">➕ Add New Game</button>
                <button class="btn btn-secondary" onclick="loadGames(1, 100)">📋 Show All Games</button>
            </div>
            <div id="games-content">
                <div class="loading">Loading games...</div>
            </div>
        </div>
        
        <!-- Categories Tab -->
        <div id="categories" class="tab-content">
            <div class="actions">
                <button class="btn btn-success" onclick="showCreateCategoryForm()">➕ Add New Category</button>
            </div>
            <div id="categories-content">
                <div class="loading">Loading categories...</div>
            </div>
        </div>
        
        <!-- Listings Tab -->
        <div id="listings" class="tab-content">
            <div id="listings-content">
                <div class="loading">Loading listings...</div>
            </div>
        </div>
    </div>
    
    <!-- Create/Edit Game Modal -->
    <div id="gameModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="gameModalTitle">Add New Game</h3>
                <button class="close-btn" onclick="closeModal('gameModal')">&times;</button>
            </div>
            <form id="gameForm">
                <div class="form-group">
                    <label>Game Name *</label>
                    <input type="text" name="name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Slug *</label>
                    <input type="text" name="slug" class="form-control" required placeholder="e.g., counter-strike-2">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" class="form-control" placeholder="Brief description of the game"></textarea>
                </div>
                <div class="form-group">
                    <label>Image URL</label>
                    <input type="url" name="image" class="form-control" placeholder="https://example.com/image.jpg">
                </div>
                <div class="form-group">
                    <label>Categories</label>
                    <div id="categoriesContainer" style="max-height: 150px; overflow-y: auto; border: 1px solid #ced4da; border-radius: 4px; padding: 0.5rem;">
                        <div class="loading">Loading categories...</div>
                    </div>
                </div>
                <div class="actions">
                    <button type="submit" class="btn btn-success">Save Game</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal('gameModal')">Cancel</button>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Create/Edit Category Modal -->
    <div id="categoryModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="categoryModalTitle">Add New Category</h3>
                <button class="close-btn" onclick="closeModal('categoryModal')">&times;</button>
            </div>
            <form id="categoryForm">
                <div class="form-group">
                    <label>Category Name *</label>
                    <input type="text" name="name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Slug *</label>
                    <input type="text" name="slug" class="form-control" required placeholder="e.g., game-keys">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" class="form-control" placeholder="Brief description of the category"></textarea>
                </div>
                <div class="form-group">
                    <label>Icon</label>
                    <input type="text" name="icon" class="form-control" placeholder="e.g., 🔑 or 🎮">
                </div>
                <div class="actions">
                    <button type="submit" class="btn btn-success">Save Category</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal('categoryModal')">Cancel</button>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Confirmation Modal -->
    <div id="confirmModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Confirm Action</h3>
                <button class="close-btn" onclick="closeModal('confirmModal')">&times;</button>
            </div>
            <p id="confirmMessage">Are you sure you want to proceed?</p>
            <div class="actions">
                <button id="confirmBtn" class="btn btn-danger">Confirm</button>
                <button class="btn btn-secondary" onclick="closeModal('confirmModal')">Cancel</button>
            </div>
        </div>
    </div>
    
    <script>
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
                const response = await fetch(\`/admin/api/users?page=\${page}&limit=\${limit}\`);
                const data = await response.json();
                
                if (data.error) {
                    content.innerHTML = \`<div class="alert alert-danger">Error: \${data.error}</div>\`;
                    return;
                }
                
                let html = '<table class="data-table"><thead><tr>';
                html += '<th>Username</th><th>Email</th><th>Name</th><th>Role</th><th>Created</th><th>Actions</th>';
                html += '</tr></thead><tbody>';
                
                data.data.forEach(user => {
                    html += \`<tr>
                        <td>\${user.username}</td>
                        <td>\${user.email}</td>
                        <td>\${user.name || '-'}</td>
                        <td><span class="badge badge-\${user.role.toLowerCase()}">\${user.role}</span></td>
                        <td>\${new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-warning btn-small" onclick="editUser('\${user.id}')">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="deleteUser('\${user.id}', '\${user.username}')">Delete</button>
                        </td>
                    </tr>\`;
                });
                
                html += '</tbody></table>';
                
                if (data.pagination) {
                    html += \`<div style="margin-top: 1rem; color: #6c757d; font-size: 0.9rem;">
                        Showing page \${data.pagination.page} of \${data.pagination.totalPages} (\${data.pagination.total} total)
                    </div>\`;
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
                const response = await fetch(\`/admin/api/games?page=\${page}&limit=\${limit}\`);
                const data = await response.json();
                
                if (data.error) {
                    content.innerHTML = \`<div class="alert alert-danger">Error: \${data.error}</div>\`;
                    return;
                }
                
                let html = '<table class="data-table"><thead><tr>';
                html += '<th>Name</th><th>Slug</th><th>Categories</th><th>Description</th><th>Listings</th><th>Created</th><th>Actions</th>';
                html += '</tr></thead><tbody>';
                
                data.data.forEach(game => {
                    // Format categories display
                    let categoriesDisplay = '-';
                    if (game.categories && game.categories.length > 0) {
                        categoriesDisplay = game.categories
                            .map(gc => \`<span style="background: #e9ecef; padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.8rem; margin-right: 0.25rem; display: inline-block; margin-bottom: 0.25rem;">\${gc.category.icon || '📂'} \${gc.category.name}</span>\`)
                            .join(' ');
                    }
                    
                    html += \`<tr>
                        <td><strong>\${game.name}</strong></td>
                        <td><code>\${game.slug}</code></td>
                        <td style="max-width: 200px;">\${categoriesDisplay}</td>
                        <td>\${game.description ? game.description.substring(0, 30) + '...' : '-'}</td>
                        <td><span class="badge badge-secondary">\${game._count?.listings || 0}</span></td>
                        <td>\${new Date(game.createdAt).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-warning btn-small" onclick="editGame('\${game.id}')">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="deleteGame('\${game.id}', '\${game.name}')">Delete</button>
                        </td>
                    </tr>\`;
                });
                
                html += '</tbody></table>';
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
                    content.innerHTML = \`<div class="alert alert-danger">Error: \${data.error}</div>\`;
                    return;
                }
                
                let html = '<table class="data-table"><thead><tr>';
                html += '<th>Icon</th><th>Name</th><th>Slug</th><th>Description</th><th>Games</th><th>Actions</th>';
                html += '</tr></thead><tbody>';
                
                data.data.forEach(category => {
                    html += \`<tr>
                        <td style="font-size: 1.2rem;">\${category.icon || '📂'}</td>
                        <td><strong>\${category.name}</strong></td>
                        <td><code>\${category.slug}</code></td>
                        <td>\${category.description || '-'}</td>
                        <td><span class="badge badge-secondary">\${category._count?.games || 0}</span></td>
                        <td>
                            <button class="btn btn-warning btn-small" onclick="editCategory('\${category.id}')">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="deleteCategory('\${category.id}', '\${category.name}')">Delete</button>
                        </td>
                    </tr>\`;
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
                const response = await fetch(\`/admin/api/listings?page=\${page}&limit=\${limit}\`);
                const data = await response.json();
                
                if (data.error) {
                    content.innerHTML = \`<div class="alert alert-danger">Error: \${data.error}</div>\`;
                    return;
                }
                
                let html = '<table class="data-table"><thead><tr>';
                html += '<th>Title</th><th>Game</th><th>Seller</th><th>Price</th><th>Type</th><th>Status</th><th>Created</th><th>Actions</th>';
                html += '</tr></thead><tbody>';
                
                data.data.forEach(listing => {
                    html += \`<tr>
                        <td><strong>\${listing.title}</strong></td>
                        <td>\${listing.game?.name || 'N/A'}</td>
                        <td>\${listing.seller?.username || 'N/A'}</td>
                        <td>PKR \${listing.price.toLocaleString()}</td>
                        <td><span class="badge badge-secondary">\${listing.type}</span></td>
                        <td><span class="badge badge-\${listing.status.toLowerCase()}">\${listing.status}</span></td>
                        <td>\${new Date(listing.createdAt).toLocaleDateString()}</td>
                        <td>
                            <select onchange="updateListingStatus('\${listing.id}', this.value)" style="font-size: 0.8rem; padding: 0.2rem;">
                                <option value="ACTIVE" \${listing.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
                                <option value="PAUSED" \${listing.status === 'PAUSED' ? 'selected' : ''}>Paused</option>
                                <option value="SOLD" \${listing.status === 'SOLD' ? 'selected' : ''}>Sold</option>
                                <option value="DELETED" \${listing.status === 'DELETED' ? 'selected' : ''}>Deleted</option>
                            </select>
                            <button class="btn btn-danger btn-small" onclick="deleteListing('\${listing.id}', '\${listing.title}')">Delete</button>
                        </td>
                    </tr>\`;
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

        // Game Forms
        function showCreateGameForm() {
            document.getElementById('gameModalTitle').textContent = 'Add New Game';
            document.getElementById('gameForm').reset();
            currentEditingId = null;
            currentEditingType = 'game';
            loadCategoriesForGame();
            showModal('gameModal');
        }

        async function editGame(id) {
            try {
                const response = await fetch(\`/admin/api/games/\${id}\`);
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
                await loadCategoriesForGame(game.categories || []);
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
                const response = await fetch(\`/admin/api/categories/\${id}\`);
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

        // Load Categories for Game Modal
        async function loadCategoriesForGame(selectedCategories = []) {
            const container = document.getElementById('categoriesContainer');
            container.innerHTML = '<div class="loading">Loading categories...</div>';
            
            try {
                const response = await fetch('/admin/api/categories');
                const data = await response.json();
                
                if (data.error) {
                    container.innerHTML = '<div class="alert alert-danger">Error loading categories</div>';
                    return;
                }
                
                let html = '';
                data.data.forEach(category => {
                    const isSelected = selectedCategories.some(sc => sc.categoryId === category.id || sc.category?.id === category.id);
                    html += \`
                        <div style="margin-bottom: 0.5rem;">
                            <label style="display: flex; align-items: center; font-weight: normal; margin-bottom: 0;">
                                <input type="checkbox" name="categoryIds" value="\${category.id}" \${isSelected ? 'checked' : ''} style="margin-right: 0.5rem;">
                                <span style="font-size: 1.2rem; margin-right: 0.5rem;">\${category.icon || '📂'}</span>
                                <span>\${category.name}</span>
                            </label>
                        </div>
                    \`;
                });
                
                container.innerHTML = html || '<div style="color: #6c757d; font-style: italic;">No categories available</div>';
            } catch (error) {
                container.innerHTML = '<div class="alert alert-danger">Error loading categories</div>';
            }
        }

        // Form Submissions
        document.getElementById('gameForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            // Collect selected category IDs
            const categoryCheckboxes = document.querySelectorAll('#categoriesContainer input[name="categoryIds"]:checked');
            data.categoryIds = Array.from(categoryCheckboxes).map(checkbox => checkbox.value);
            
            try {
                let response;
                if (currentEditingId) {
                    response = await fetch(\`/admin/api/games/\${currentEditingId}\`, {
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
                    alert('Game saved successfully!');
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
                    response = await fetch(\`/admin/api/categories/\${currentEditingId}\`, {
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
                    alert('Category saved successfully!');
                } else {
                    alert('Error saving category');
                }
            } catch (error) {
                alert('Error saving category');
            }
        });

        // Delete Functions
        function deleteGame(id, name) {
            if (confirm(\`Are you sure you want to delete game "\${name}"? This will also delete all associated listings and categories.\`)) {
                fetch(\`/admin/api/games/\${id}\`, { method: 'DELETE' })
                    .then(response => {
                        if (response.ok) {
                            loadGames();
                            loadDashboardStats();
                            alert('Game deleted successfully!');
                        } else {
                            alert('Error deleting game');
                        }
                    })
                    .catch(error => {
                        alert('Error deleting game');
                    });
            }
        }

        function deleteCategory(id, name) {
            if (confirm(\`Are you sure you want to delete category "\${name}"?\`)) {
                fetch(\`/admin/api/categories/\${id}\`, { method: 'DELETE' })
                    .then(response => {
                        if (response.ok) {
                            loadCategories();
                            loadDashboardStats();
                            alert('Category deleted successfully!');
                        } else {
                            alert('Error deleting category');
                        }
                    })
                    .catch(error => {
                        alert('Error deleting category');
                    });
            }
        }

        function deleteUser(id, username) {
            if (confirm(\`Are you sure you want to delete user "\${username}"? This action cannot be undone.\`)) {
                fetch(\`/admin/api/users/\${id}\`, { method: 'DELETE' })
                    .then(response => {
                        if (response.ok) {
                            loadUsers();
                            loadDashboardStats();
                            alert('User deleted successfully!');
                        } else {
                            alert('Error deleting user');
                        }
                    })
                    .catch(error => {
                        alert('Error deleting user');
                    });
            }
        }

        function deleteListing(id, title) {
            if (confirm(\`Are you sure you want to delete listing "\${title}"?\`)) {
                fetch(\`/admin/api/listings/\${id}\`, { method: 'DELETE' })
                    .then(response => {
                        if (response.ok) {
                            loadListings();
                            loadDashboardStats();
                            alert('Listing deleted successfully!');
                        } else {
                            alert('Error deleting listing');
                        }
                    })
                    .catch(error => {
                        alert('Error deleting listing');
                    });
            }
        }

        // Update listing status
        async function updateListingStatus(id, status) {
            try {
                const response = await fetch(\`/admin/api/listings/\${id}\`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status })
                });
                
                if (response.ok) {
                    loadListings();
                    alert('Listing status updated!');
                } else {
                    alert('Error updating listing status');
                }
            } catch (error) {
                alert('Error updating listing status');
            }
        }

        // Auto-generate slug from name
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                const forms = ['gameForm', 'categoryForm'];
                forms.forEach(formId => {
                    const form = document.getElementById(formId);
                    if (form) {
                        const nameInput = form.querySelector('input[name="name"]');
                        const slugInput = form.querySelector('input[name="slug"]');
                        
                        if (nameInput && slugInput) {
                            nameInput.addEventListener('input', function() {
                                if (!slugInput.value || !currentEditingId) {
                                    slugInput.value = this.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9]/g, '-')
                                        .replace(/-+/g, '-')
                                        .replace(/^-|-$/g, '');
                                }
                            });
                        }
                    }
                });
            }, 100);
        });
    </script>
</body>
</html>`