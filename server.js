const express = require('express');
const app = express();
const PORT = 8099;

// Log token status on startup
const TOKEN = process.env.SUPERVISOR_TOKEN;
const MISSING_TOKEN = "Token missing on server";

app.use(express.static('public'));
app.use(express.json());

app.get('/api/get-states', async (_req, res) => {
    if (!TOKEN) return res.status(500).json({ error: MISSING_TOKEN });
    
    try {
        const response = await fetch("http://supervisor/core/api/states", {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const responseJson = await response.json();
            res.json(responseJson);
        } else {
            const err = await response.json();
            res.status(response.status).json(err);
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/run-script', async (req, res) => {
    if (!TOKEN) return res.status(500).json({ error: MISSING_TOKEN });
try {       
        const response = await fetch("http://supervisor/core/api/services/script/turn_on", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ entity_id: req.body.entityId })
        });

        if (response.ok) {
            res.json({ success: true });
        } else {
            const err = await response.json();
            res.status(response.status).json(err);
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});



app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
});