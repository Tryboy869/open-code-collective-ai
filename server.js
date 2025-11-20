// server.js - BACKEND SERVICE (Logique métier)
// Architecture: NEXUS AXION 3.5

import { createClient } from '@libsql/client';
import { Octokit } from '@octokit/rest';
import fetch from 'node-fetch';

// ========== BACKEND SERVICE CLASS ==========
export class BackendService {
  constructor() {
    this.dbGlobal = null;
    this.dbCritical = null;
    this.stats = {
      totalUsers: 0,
      totalRepos: 0,
      totalLines: 0
    };
  }

  // ========== INITIALIZATION ==========
  async init() {
    console.log('🔧 [BACKEND] Initializing...');
    
    // Initialize Turso DB1 (Global dataset)
    this.dbGlobal = createClient({
      url: process.env.TURSO_GLOBAL_URL || 'file:./global.db',
      authToken: process.env.TURSO_GLOBAL_TOKEN
    });
    
    // Initialize Turso DB2 (Critical data)
    this.dbCritical = createClient({
      url: process.env.TURSO_CRITICAL_URL || 'file:./critical.db',
      authToken: process.env.TURSO_CRITICAL_TOKEN
    });
    
    // Create tables if not exist
    await this.createTables();
    
    // Load initial stats
    await this.refreshStats();
    
    console.log('✅ [BACKEND] Initialization complete');
  }

  async createTables() {
    console.log('📊 [BACKEND] Creating/checking database tables...');
    
    // DB1: Global dataset
    await this.dbGlobal.execute(`
      CREATE TABLE IF NOT EXISTS code_embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repo_id INTEGER,
        file_path TEXT,
        language TEXT,
        summary TEXT,
        lines_of_code INTEGER,
        quality_score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await this.dbGlobal.execute(`
      CREATE TABLE IF NOT EXISTS dataset_stats (
        language TEXT PRIMARY KEY,
        total_files INTEGER DEFAULT 0,
        total_lines INTEGER DEFAULT 0,
        contributors INTEGER DEFAULT 0,
        avg_quality_score REAL,
        last_updated TIMESTAMP
      )
    `);
    
    // DB2: Critical data
    await this.dbCritical.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        github_username TEXT UNIQUE,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_founding_member BOOLEAN DEFAULT 0
      )
    `);
    
    await this.dbCritical.execute(`
      CREATE TABLE IF NOT EXISTS repositories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        repo_name TEXT,
        repo_url TEXT,
        language TEXT,
        size_category TEXT,
        lines_of_code INTEGER,
        quality_score INTEGER,
        stars INTEGER,
        has_tests BOOLEAN,
        status TEXT DEFAULT 'pending',
        credits_earned INTEGER DEFAULT 0,
        last_sync TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    await this.dbCritical.execute(`
      CREATE TABLE IF NOT EXISTS credits (
        user_id INTEGER PRIMARY KEY,
        amount INTEGER DEFAULT 0,
        total_earned INTEGER DEFAULT 0,
        total_spent INTEGER DEFAULT 0,
        last_updated TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    await this.dbCritical.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT,
        amount INTEGER,
        source TEXT,
        reference_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    await this.dbCritical.execute(`
      CREATE TABLE IF NOT EXISTS generations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        prompt TEXT,
        complexity TEXT,
        language TEXT,
        credits_spent INTEGER,
        verification_passed BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    await this.dbCritical.execute(`
      CREATE TABLE IF NOT EXISTS system_config (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP
      )
    `);
    
    // Initialize system config
    await this.dbCritical.execute(`
      INSERT OR IGNORE INTO system_config VALUES 
        ('monetization_enabled', '0', CURRENT_TIMESTAMP),
        ('user_count_threshold', '1000', CURRENT_TIMESTAMP),
        ('current_active_users', '0', CURRENT_TIMESTAMP)
    `);
    
    console.log('✅ [BACKEND] Database tables ready');
  }

  // ========== AUTHENTICATION ==========
  async login(data) {
    console.log('[BACKEND] Login attempt:', data.username);
    
    try {
      // Check if user exists
      let user = await this.dbCritical.execute(
        'SELECT * FROM users WHERE github_username = ?',
        [data.username]
      );
      
      if (user.rows.length === 0) {
        // Create new user
        await this.dbCritical.execute(
          'INSERT INTO users (github_username, last_login) VALUES (?, CURRENT_TIMESTAMP)',
          [data.username]
        );
        
        user = await this.dbCritical.execute(
          'SELECT * FROM users WHERE github_username = ?',
          [data.username]
        );
        
        // Initialize credits
        await this.dbCritical.execute(
          'INSERT INTO credits (user_id, amount) VALUES (?, 10)',
          [user.rows[0].id]
        );
        
        console.log('✅ [BACKEND] New user created:', data.username);
      } else {
        // Update last login
        await this.dbCritical.execute(
          'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE github_username = ?',
          [data.username]
        );
        
        console.log('✅ [BACKEND] Existing user logged in:', data.username);
      }
      
      await this.refreshStats();
      
      return {
        success: true,
        message: 'Login successful',
        userId: user.rows[0].id
      };
    } catch (error) {
      console.error('❌ [BACKEND] Login error:', error);
      return {
        success: false,
        message: 'Login failed: ' + error.message
      };
    }
  }

  // ========== REPOS MANAGEMENT ==========
  async listRepos(username, token) {
    console.log('[BACKEND] Listing repos for:', username);
    
    try {
      const octokit = new Octokit({
        auth: Buffer.from(token, 'base64').toString('utf-8')
      });
      
      const { data: repos } = await octokit.repos.listForAuthenticatedUser({
        visibility: 'public',
        per_page: 100
      });
      
      // Get user ID
      const user = await this.dbCritical.execute(
        'SELECT id FROM users WHERE github_username = ?',
        [username]
      );
      
      if (user.rows.length === 0) {
        throw new Error('User not found');
      }
      
      const userId = user.rows[0].id;
      
      // Check which repos are already contributed
      const contributed = await this.dbCritical.execute(
        'SELECT repo_name FROM repositories WHERE user_id = ?',
        [userId]
      );
      
      const contributedNames = new Set(contributed.rows.map(r => r.repo_name));
      
      const processedRepos = repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        language: repo.language,
        size: repo.size,
        stars: repo.stargazers_count,
        license: repo.license?.spdx_id,
        contributed: contributedNames.has(repo.name)
      }));
      
      console.log(`✅ [BACKEND] Found ${processedRepos.length} repos for ${username}`);
      
      return {
        success: true,
        repos: processedRepos
      };
    } catch (error) {
      console.error('❌ [BACKEND] List repos error:', error);
      return {
        success: false,
        message: 'Failed to list repos: ' + error.message
      };
    }
  }

  async contributeRepos(username, repoIds) {
    console.log('[BACKEND] Contributing repos:', repoIds);
    
    try {
      // Get user
      const user = await this.dbCritical.execute(
        'SELECT id FROM users WHERE github_username = ?',
        [username]
      );
      
      if (user.rows.length === 0) {
        throw new Error('User not found');
      }
      
      const userId = user.rows[0].id;
      let totalCredits = 0;
      let processed = 0;
      
      // Process each repo (simplified for MVP)
      for (const repoId of repoIds) {
        // Calculate credits based on size/quality
        const credits = this.calculateRepoCredits({
          size: 'medium',
          hasTests: false,
          quality: 50
        });
        
        // Add repo to database
        await this.dbCritical.execute(
          `INSERT INTO repositories 
           (user_id, repo_name, repo_url, status, credits_earned) 
           VALUES (?, ?, ?, 'active', ?)`,
          [userId, `repo_${repoId}`, `https://github.com/user/repo_${repoId}`, credits]
        );
        
        // Add credits to user
        await this.addCredits(userId, credits, 'repo_contribution', repoId);
        
        totalCredits += credits;
        processed++;
      }
      
      await this.refreshStats();
      
      console.log(`✅ [BACKEND] Processed ${processed} repos, earned ${totalCredits} credits`);
      
      return {
        success: true,
        processed,
        creditsEarned: totalCredits
      };
    } catch (error) {
      console.error('❌ [BACKEND] Contribute error:', error);
      return {
        success: false,
        message: 'Failed to contribute repos: ' + error.message
      };
    }
  }

  calculateRepoCredits(repoData) {
    let credits = 0;
    
    // Base credits by size
    const sizeMap = {
      'small': 3,
      'medium': 5,
      'large': 10,
      'huge': 15
    };
    
    credits += sizeMap[repoData.size] || 5;
    
    // Bonus for tests
    if (repoData.hasTests) credits += 2;
    
    // Bonus for quality
    if (repoData.quality > 70) credits += 2;
    
    return credits;
  }

  // ========== CODE GENERATION ==========
  async generateCode(username, data) {
    console.log('[BACKEND] Generating code for:', username);
    console.log('[BACKEND] Prompt:', data.prompt);
    console.log('[BACKEND] Language:', data.language);
    console.log('[BACKEND] Complexity:', data.complexity);
    
    try {
      // Get user
      const user = await this.dbCritical.execute(
        'SELECT id FROM users WHERE github_username = ?',
        [username]
      );
      
      if (user.rows.length === 0) {
        throw new Error('User not found');
      }
      
      const userId = user.rows[0].id;
      
      // Calculate credits cost
      const creditsMap = {
        'snippet': 1,
        'script': 2,
        'component': 5,
        'app': 10,
        'system': 20
      };
      
      const creditsCost = creditsMap[data.complexity] || 5;
      
      // Check user has enough credits
      const credits = await this.dbCritical.execute(
        'SELECT amount FROM credits WHERE user_id = ?',
        [userId]
      );
      
      if (credits.rows.length === 0 || credits.rows[0].amount < creditsCost) {
        return {
          success: false,
          message: 'Insufficient credits'
        };
      }
      
      // Generate code with user's AI config
      const code = await this.callUserAI(data);
      
      // Verification 2: Check generated code
      const verification = await this.verifyGeneratedCode(code, data.language);
      
      if (!verification.passed) {
        return {
          success: false,
          message: 'Generated code failed verification: ' + verification.error
        };
      }
      
      // Deduct credits
      await this.deductCredits(userId, creditsCost, 'generation');
      
      // Log generation
      await this.dbCritical.execute(
        `INSERT INTO generations 
         (user_id, prompt, complexity, language, credits_spent, verification_passed) 
         VALUES (?, ?, ?, ?, ?, 1)`,
        [userId, data.prompt, data.complexity, data.language, creditsCost]
      );
      
      console.log(`✅ [BACKEND] Code generated, ${creditsCost} credits spent`);
      
      return {
        success: true,
        code: code,
        creditsSpent: creditsCost
      };
    } catch (error) {
      console.error('❌ [BACKEND] Generate error:', error);
      return {
        success: false,
        message: 'Failed to generate code: ' + error.message
      };
    }
  }

  async callUserAI(data) {
    // Call user's configured AI
    const { aiConfig, prompt, language } = data;
    
    console.log('[BACKEND] Calling AI:', aiConfig.provider);
    
    try {
      if (aiConfig.provider === 'openai') {
        return await this.callOpenAI(aiConfig, prompt, language);
      } else if (aiConfig.provider === 'groq') {
        return await this.callGroq(aiConfig, prompt, language);
      } else if (aiConfig.provider === 'anthropic') {
        return await this.callAnthropic(aiConfig, prompt, language);
      } else if (aiConfig.provider === 'local') {
        return await this.callLocal(aiConfig, prompt, language);
      }
      
      throw new Error('Unsupported AI provider');
    } catch (error) {
      console.error('❌ [BACKEND] AI call error:', error);
      throw error;
    }
  }

  async callOpenAI(config, prompt, language) {
    const apiKey = Buffer.from(config.apiKey, 'base64').toString('utf-8');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert ${language} programmer. Generate clean, well-documented code.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 2000
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }
    
    return data.choices[0].message.content;
  }

  async callGroq(config, prompt, language) {
    const apiKey = Buffer.from(config.apiKey, 'base64').toString('utf-8');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.model || 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an expert ${language} programmer.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 2000
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callAnthropic(config, prompt, language) {
    const apiKey = Buffer.from(config.apiKey, 'base64').toString('utf-8');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-opus-20240229',
        max_tokens: config.maxTokens || 2000,
        messages: [
          {
            role: 'user',
            content: `Generate ${language} code for: ${prompt}`
          }
        ]
      })
    });
    
    const data = await response.json();
    return data.content[0].text;
  }

  async callLocal(config, prompt, language) {
    const response = await fetch(`${config.ollamaEndpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model || 'llama3',
        prompt: `Generate ${language} code for: ${prompt}`,
        stream: false
      })
    });
    
    const data = await response.json();
    return data.response;
  }

  async verifyGeneratedCode(code, language) {
    console.log('[BACKEND] Verifying generated code...');
    
    // Basic verification
    if (!code || code.length < 10) {
      return { passed: false, error: 'Code too short' };
    }
    
    // Check for common errors
    if (code.includes('ERROR') || code.includes('FAILED')) {
      return { passed: false, error: 'Code contains error markers' };
    }
    
    // Language-specific checks
    if (language === 'javascript' || language === 'typescript') {
      if (!code.includes('function') && !code.includes('=>') && !code.includes('const')) {
        return { passed: false, error: 'Invalid JavaScript/TypeScript structure' };
      }
    }
    
    console.log('✅ [BACKEND] Code verification passed');
    
    return { passed: true };
  }

  // ========== CREDITS MANAGEMENT ==========
  async addCredits(userId, amount, source, referenceId = null) {
    console.log(`[BACKEND] Adding ${amount} credits to user ${userId}`);
    
    await this.dbCritical.execute(
      `UPDATE credits 
       SET amount = amount + ?, 
           total_earned = total_earned + ?,
           last_updated = CURRENT_TIMESTAMP 
       WHERE user_id = ?`,
      [amount, amount, userId]
    );
    
    await this.dbCritical.execute(
      `INSERT INTO transactions (user_id, type, amount, source, reference_id) 
       VALUES (?, 'earn', ?, ?, ?)`,
      [userId, amount, source, referenceId]
    );
  }

  async deductCredits(userId, amount, source, referenceId = null) {
    console.log(`[BACKEND] Deducting ${amount} credits from user ${userId}`);
    
    await this.dbCritical.execute(
      `UPDATE credits 
       SET amount = amount - ?, 
           total_spent = total_spent + ?,
           last_updated = CURRENT_TIMESTAMP 
       WHERE user_id = ?`,
      [amount, amount, userId]
    );
    
    await this.dbCritical.execute(
      `INSERT INTO transactions (user_id, type, amount, source, reference_id) 
       VALUES (?, 'spend', ?, ?, ?)`,
      [userId, amount, source, referenceId]
    );
  }

  async getUserCredits(username) {
    const user = await this.dbCritical.execute(
      'SELECT id FROM users WHERE github_username = ?',
      [username]
    );
    
    if (user.rows.length === 0) {
      return { success: false, message: 'User not found' };
    }
    
    const credits = await this.dbCritical.execute(
      'SELECT amount FROM credits WHERE user_id = ?',
      [user.rows[0].id]
    );
    
    return {
      success: true,
      credits: credits.rows[0]?.amount || 0
    };
  }

  // ========== STATS ==========
  async getUserStats(username) {
    const user = await this.dbCritical.execute(
      'SELECT id FROM users WHERE github_username = ?',
      [username]
    );
    
    if (user.rows.length === 0) {
      return { success: false, message: 'User not found' };
    }
    
    const userId = user.rows[0].id;
    
    const repos = await this.dbCritical.execute(
      'SELECT COUNT(*) as count FROM repositories WHERE user_id = ?',
      [userId]
    );
    
    const credits = await this.dbCritical.execute(
      'SELECT total_earned, total_spent FROM credits WHERE user_id = ?',
      [userId]
    );
    
    const generations = await this.dbCritical.execute(
      'SELECT COUNT(*) as count FROM generations WHERE user_id = ?',
      [userId]
    );
    
    return {
      success: true,
      repos: repos.rows[0].count,
      creditsEarned: credits.rows[0]?.total_earned || 0,
      creditsSpent: credits.rows[0]?.total_spent || 0,
      generations: generations.rows[0].count
    };
  }

  async getGlobalStats() {
    return {
      success: true,
      users: this.stats.totalUsers,
      repos: this.stats.totalRepos,
      lines: this.stats.totalLines,
      languages: {
        'JavaScript': 1250,
        'TypeScript': 890,
        'Python': 756,
        'Go': 432,
        'Rust': 321
      }
    };
  }

  async refreshStats() {
    const users = await this.dbCritical.execute('SELECT COUNT(*) as count FROM users');
    const repos = await this.dbCritical.execute('SELECT COUNT(*) as count FROM repositories');
    
    this.stats.totalUsers = users.rows[0].count;
    this.stats.totalRepos = repos.rows[0].count;
    this.stats.totalLines = repos.rows[0].count * 5000; // Estimated
  }

  // ========== HEALTH CHECK ==========
  async healthCheck() {
    try {
      await this.dbCritical.execute('SELECT 1');
      await this.dbGlobal.execute('SELECT 1');
      
      return {
        database: 'connected',
        stats: this.stats
      };
    } catch (error) {
      return {
        database: 'offline',
        error: error.message
      };
    }
  }

  async testAIConnection(aiConfig) {
    console.log('[BACKEND] Testing AI connection:', aiConfig.provider);
    
    try {
      const testPrompt = 'console.log("Hello World");';
      await this.callUserAI({
        aiConfig,
        prompt: 'Write a simple Hello World in JavaScript',
        language: 'javascript'
      });
      
      return {
        success: true,
        message: 'AI connection successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // ========== CLEANUP ==========
  async cleanup() {
    console.log('🧹 [BACKEND] Cleaning up...');
    // Close database connections, etc.
  }
}