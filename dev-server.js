#!/usr/bin/env node
import express from 'express';
import { readFileSync } from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  console.log('✓ Loaded .env.local');
} catch (err) {
  console.warn('⚠ Could not load .env.local:', err.message);
}

const app = express();
const PORT = 3001;

app.use(express.json());

// API Proxy endpoint for Claude
app.post('/api/claude', async (req, res) => {
  try {
    const { prompt, maxTokens = 1024 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      console.error('❌ ANTHROPIC_API_KEY not configured');
      return res.status(500).json({ error: 'API key not configured on server' });
    }
    
    console.log('→ Calling Anthropic API...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Anthropic API error (${response.status}):`, errorText);
      return res.status(response.status).json({ 
        error: `API Error: ${response.statusText}`,
        details: errorText 
      });
    }
    
    const data = await response.json();
    console.log('✓ Anthropic API response received');
    
    const content = data.content?.[0];
    
    if (content?.type === 'text') {
      return res.json({ text: content.text });
    }
    
    return res.json({ text: 'No output from API.' });
  } catch (error) {
    console.error('❌ API proxy error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      details: String(error)
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY });
});

app.listen(PORT, () => {
  console.log(`\n🚀 API Server running on port ${PORT}`);
  console.log(`   Frontend: http://localhost:3000`);
  console.log(`   API Key: ${process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Not found'}\n`);
});
