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
app.use(express.static('../frontend')); // Serve frontend files

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
// ===== PROMPT REGISTRY ENDPOINT =====
app.get('/api/prompt-config/:mode/:subtab', (req, res) => {
    const { mode, subtab } = req.params;
    
    // Simple prompt registry (matches frontend)
    const promptRegistry = {
        devotional: {
            micro_units: {
                id: 'dev_micro_units',
                title: 'Devotional Micro-Units',
                description: 'Break passage into bite-sized units for prayerful meditation',
                temperature: 0.5,
                maxTokens: 2000
            },
            gospel_lens: {
                id: 'dev_gospel_lens',
                title: 'Gospel Lens',
                description: 'Explore how this passage reveals Christ and the gospel',
                temperature: 0.6,
                maxTokens: 2000
            }
        },
        academic: {
            syntax: {
                id: 'acad_syntax',
                title: 'Syntax Analysis',
                description: 'Trace the clauses, connectors, and grammatical relationships',
                temperature: 0.5,
                maxTokens: 3000
            },
            discourse: {
                id: 'acad_discourse',
                title: 'Discourse Flow',
                description: 'Follow the argument, movements, and transitions',
                temperature: req.body.temperature || 0.7,
                maxTokens: 2500
            }
        }
    };
    
    const config = promptRegistry[mode]?.[subtab];
    
    if (!config) {
        return res.status(404).json({ error: 'Prompt configuration not found' });
    }
    
    res.json({
        success: true,
        config: config,
        mode: mode,
        subtab: subtab
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
                temperature: req.body.temperature || 0.7,
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

// ===== HELP ENDPOINT (Q&A WITH CONTEXTUAL FOLLOW-UPS) =====
app.post('/api/help', async (req, res) => {
    try {
        const { question, passage, mode, subtab, conversationHistory } = req.body;

        // Validation
        if (!question) {
            return res.status(400).json({ 
                error: 'Missing required field: question' 
            });
        }

        if (!GROQ_API_KEY) {
            return res.status(500).json({ 
                error: 'Server configuration error: API key not set' 
            });
        }

        // Build context from conversation history and current mode
        let conversationContext = '';
        if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
            conversationContext = '\n\nPrevious questions asked in this session:\n';
            conversationHistory.forEach((item, idx) => {
                conversationContext += `${idx + 1}. ${item.question}\n`;
            });
            conversationContext += '\n---\n\n';
        }

        // Build the help prompt
        const helpPrompt = `You are a Scripture study assistant helping users understand passages and concepts in the Bible.

Current Context:
- Module: ${mode || 'General'}
- Focus: ${subtab || 'General understanding'}
- Passage: ${passage || 'Not specified'}
${conversationContext}

User's Question: ${question}

Provide a clear, helpful answer (2-3 sentences, conversational tone). Then suggest 3-4 follow-up questions the user might find interesting to explore next. Format your response as JSON with this exact structure:
{
  "answer": "Your answer here...",
  "suggestedQuestions": [
    "Question 1?",
    "Question 2?",
    "Question 3?",
    "Question 4?"
  ]
}

IMPORTANT: You MUST respond with valid JSON only. No markdown, no extra text, just the JSON object.`;

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
                        content: helpPrompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000,
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
        const responseText = data.choices[0].message.content;

        // Parse JSON response
        let parsedResponse;
        try {
            // Try to extract JSON from the response (in case there's extra text)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : responseText;
            parsedResponse = JSON.parse(jsonString);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', responseText);
            // Fallback response if parsing fails
            parsedResponse = {
                answer: responseText,
                suggestedQuestions: [
                    "Could you explain that more?",
                    "What about the broader context?",
                    "How does this apply today?",
                    "What does the original language reveal?"
                ]
            };
        }

        // Ensure answer and suggestedQuestions exist
        const answer = parsedResponse.answer || responseText;
        const suggestedQuestions = Array.isArray(parsedResponse.suggestedQuestions) 
            ? parsedResponse.suggestedQuestions.slice(0, 4)
            : [];

        // Return help response
        res.json({
            success: true,
            answer: answer,
            suggestedQuestions: suggestedQuestions,
            passage: passage,
            question: question,
            mode: mode,
            subtab: subtab,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Help Endpoint Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// ===== NET BIBLE NOTES ENDPOINT =====
app.post('/api/net-notes', async (req, res) => {
    try {
        const { passage } = req.body;

        if (!passage) {
            return res.status(400).json({ error: 'Missing passage' });
        }

        // NOTE: Full NET Bible notes require premium access to nets.org
        // For now, we return a message indicating notes aren't available
        // In a future implementation, you could:
        // 1. Integrate with nets.org API if API access becomes available
        // 2. Store cached NET notes in a database
        // 3. Use alternative note sources
        
        res.json({
            passage: passage,
            notes: null,
            message: 'NET Bible notes require premium subscription at nets.org'
        });

    } catch (error) {
        console.error('NET Notes Error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch NET notes',
            message: error.message 
        });
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
