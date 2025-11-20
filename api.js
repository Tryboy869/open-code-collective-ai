// api.js - API GATEWAY (Point d'entrée unique)
// Architecture: NEXUS AXION 3.5

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { BackendService } from './server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname)); // Serve frontend

// ========== INITIALIZE BACKEND ==========
let backend;

async function initBackend() {
  console.log('🔧 [API GATEWAY] Initializing backend service...');
  try {
    backend = new BackendService();
    await backend.init();
    console.log('✅ [API GATEWAY] Backend service ready');
  } catch (error) {
    console.error('❌ [API GATEWAY] Backend initialization failed:', error);
    process.exit(1);
  }
}

// ========== ROUTE MAP ==========
const routeMap = {
  'POST:/api/auth/login': async (req) => {
    console.log('📡 [ROUTE] POST /api/auth/login');
    return await backend.login(req.body);
  },
  
  'GET:/api/repos/list': async (req) => {
    console.log('📡 [ROUTE] GET /api/repos/list');
    const userId = req.headers['x-user-id'];
    const token = req.headers['x-token'];
    return await backend.listRepos(userId, token);
  },
  
  'POST:/api/repos/contribute': async (req) => {
    console.log('📡 [ROUTE] POST /api/repos/contribute');
    const userId = req.headers['x-user-id'];
    return await backend.contributeRepos(userId, req.body.repoIds);
  },
  
  'POST:/api/generate': async (req) => {
    console.log('📡 [ROUTE] POST /api/generate');
    const userId = req.headers['x-user-id'];
    return await backend.generateCode(userId, req.body);
  },
  
  'GET:/api/user/credits': async (req) => {
    console.log('📡 [ROUTE] GET /api/user/credits');
    const userId = req.headers['x-user-id'];
    return await backend.getUserCredits(userId);
  },
  
  'GET:/api/user/stats': async (req) => {
    console.log('📡 [ROUTE] GET /api/user/stats');
    const userId = req.headers['x-user-id'];
    return await backend.getUserStats(userId);
  },
  
  'GET:/api/stats/global': async (req) => {
    console.log('📡 [ROUTE] GET /api/stats/global');
    return await backend.getGlobalStats();
  },
  
  'POST:/api/ai/test': async (req) => {
    console.log('📡 [ROUTE] POST /api/ai/test');
    return await backend.testAIConnection(req.body.aiConfig);
  }
};

// ========== ROUTER CENTRAL ==========
async function routeRequest(method, path, req) {
  const routeKey = `${method}:${path}`;
  
  console.log(`📡 [API GATEWAY] ${routeKey}`);
  console.log(`   └─ User: ${req.headers['x-user-id'] || 'anonymous'}`);
  console.log(`   └─ IP: ${req.ip}`);
  
  const handler = routeMap[routeKey];
  
  if (!handler) {
    console.error(`❌ [API GATEWAY] Route not found: ${routeKey}`);
    throw new Error(`Route not mapped: ${routeKey}`);
  }
  
  const startTime = Date.now();
  const result = await handler(req);
  const duration = Date.now() - startTime;
  
  console.log(`✅ [API GATEWAY] ${routeKey} completed in ${duration}ms`);
  
  return result;
}

// ========== SERVE FRONTEND ==========
app.get('/', (req, res) => {
  console.log('🌐 [API GATEWAY] Serving frontend: index.html');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ========== HEALTH CHECK ==========
app.get('/health', async (req, res) => {
  console.log('🏥 [API GATEWAY] Health check requested');
  
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  };
  
  try {
    const backendHealth = await backend.healthCheck();
    health.backend = backendHealth;
  } catch (error) {
    health.status = 'degraded';
    health.backend = { error: error.message };
  }
  
  res.json(health);
});

// ========== API ENDPOINTS ==========

// Auth
app.post('/api/auth/login', async (req, res) => {
  try {
    const result = await routeRequest('POST', '/api/auth/login', req);
    res.json(result);
  } catch (error) {
    console.error('❌ [API GATEWAY] Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Repos
app.get('/api/repos/list', async (req, res) => {
  try {
    const result = await routeRequest('GET', '/api/repos/list', req);
    res.json(result);
  } catch (error) {
    console.error('❌ [API GATEWAY] List repos error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/repos/contribute', async (req, res) => {
  try {
    const result = await routeRequest('POST', '/api/repos/contribute', req);
    res.json(result);
  } catch (error) {
    console.error('❌ [API GATEWAY] Contribute error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generation
app.post('/api/generate', async (req, res) => {
  try {
    const result = await routeRequest('POST', '/api/generate', req);
    res.json(result);
  } catch (error) {
    console.error('❌ [API GATEWAY] Generate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// User data
app.get('/api/user/credits', async (req, res) => {
  try {
    const result = await routeRequest('GET', '/api/user/credits', req);
    res.json(result);
  } catch (error) {
    console.error('❌ [API GATEWAY] Get credits error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/user/stats', async (req, res) => {
  try {
    const result = await routeRequest('GET', '/api/user/stats', req);
    res.json(result);
  } catch (error) {
    console.error('❌ [API GATEWAY] Get user stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Global stats
app.get('/api/stats/global', async (req, res) => {
  try {
    const result = await routeRequest('GET', '/api/stats/global', req);
    res.json(result);
  } catch (error) {
    console.error('❌ [API GATEWAY] Get global stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// AI test
app.post('/api/ai/test', async (req, res) => {
  try {
    const result = await routeRequest('POST', '/api/ai/test', req);
    res.json(result);
  } catch (error) {
    console.error('❌ [API GATEWAY] AI test error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== ERROR HANDLERS ==========
app.use((err, req, res, next) => {
  console.error('💥 [API GATEWAY] Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res) => {
  console.warn(`⚠️ [API GATEWAY] 404: ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path
  });
});

// ========== START SERVER ==========
async function startServer() {
  await initBackend();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║   🌌 OPEN-CODE COLLECTIVE AI                          ║
║   🔀 API Gateway: Nexus Axion 3.5                     ║
║                                                       ║
║   🌐 Server:     http://0.0.0.0:${PORT}                       ║
║   📂 Frontend:   index.html                           ║
║   ⚙️  Backend:    server.js                            ║
║   🔀 Gateway:    api.js (this file)                   ║
║   ✅ Routes:     ${Object.keys(routeMap).length} endpoints mapped                  ║
║                                                       ║
║   📊 Status:     Ready to accept requests             ║
╚═══════════════════════════════════════════════════════╝
    `);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 [API GATEWAY] SIGTERM received, shutting down gracefully...');
  await backend.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 [API GATEWAY] SIGINT received, shutting down gracefully...');
  await backend.cleanup();
  process.exit(0);
});

startServer().catch(error => {
  console.error('💥 [API GATEWAY] Failed to start server:', error);
  process.exit(1);
});