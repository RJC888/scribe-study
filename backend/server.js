// ===== SCRIBE STUDY BACKEND SERVER =====
// Handles AI API calls so users don't need API keys

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('frontend')); // Serve frontend files

// Rate limiting - prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// ===== GROQ API CONFIGURATION =====
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Scribe Study API is running',
        hasApiKey: !!GROQ_API_KEY 
    });
});

// ===== MAIN ANALYSIS ENDPOINT =====
app.post('/api/analyze', async (req, res) => {
    try {
        const { prompt, passage, moduleName } = req.body;

        // Validation
        if (!prompt || !passage) {
            return res.status(400).json({ 
                error: 'Missing required fields: prompt and passage' 
            });
        }

        if (!GROQ_API_KEY) {
            return res.status(500).json({ 
                error: 'Server configuration error: API key not set' 
            });
        }

        // Call Groq API
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4096,
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Groq API Error:', errorData);
            return res.status(response.status).json({ 
                error: errorData.error?.message || 'AI service error',
                details: errorData
            });
        }

        const data = await response.json();
        const analysis = data.choices[0].message.content;

        // Return analysis
        res.json({
            success: true,
            analysis: analysis,
            passage: passage,
            moduleName: moduleName,
            model: GROQ_MODEL,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// ===== STREAMING ENDPOINT (Optional - for future) =====
app.post('/api/analyze-stream', async (req, res) => {
    try {
        const { prompt, passage } = req.body;

        if (!GROQ_API_KEY) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Set up SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 4096,
                stream: true
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;
                    
                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0]?.delta?.content || '';
                        if (content) {
                            res.write(`data: ${JSON.stringify({ content })}\n\n`);
                        }
                    } catch (e) {
                        // Skip malformed chunks
                    }
                }
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Streaming Error:', error);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║        🕮  SCRIBE STUDY API SERVER RUNNING  🕮        ║
║                                                       ║
║  Server: http://localhost:${PORT}                       ║
║  Status: http://localhost:${PORT}/api/health            ║
║                                                       ║
║  API Key: ${GROQ_API_KEY ? '✓ Configured' : '✗ Missing'}                       ║
║  Model: ${GROQ_MODEL}                 ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);

    if (!GROQ_API_KEY) {
        console.warn('⚠️  WARNING: GROQ_API_KEY not set in .env file!');
        console.warn('   Create a .env file with: GROQ_API_KEY=your_key_here');
    }
});

module.exports = app;
