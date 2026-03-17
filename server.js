const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 8099;

// Log token status on startup
const TOKEN = process.env.SUPERVISOR_TOKEN;

app.use(express.static('public'));
app.use(express.json());

// Serve the bundles folder as static assets
app.use('/api/shows', express.static(path.join(__dirname, 'shows')));

// API to list available shows
app.get('/api/get-show-list', (req, res) => {
  const showsPath = path.join(__dirname, 'shows');
  const folders = fs.readdirSync(showsPath).filter(f => 
    fs.statSync(path.join(showsPath, f)).isDirectory()
  );
  res.json(folders);
});

app.post('/api/:domain/:service', async (req, res) => {
    const { domain, service } = req.params;
    const response = await fetch(`http://supervisor/core/api/services/${domain}/${service}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
    });
    res.json({ success: response.ok });
})

app.get('/api/lights', async (req, res) => {
    try {
        const response = await fetch(`http://supervisor/core/api/states`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // 1. Check if the fetch itself was successful
        if (!response.ok) {
            throw new Error(`HA API responded with ${response.status}`);
        }

        // 2. Parse the body (This is the missing step!)
        const data = await response.json();

        // 3. Now filter the parsed array
        const lights = data
            .filter(entity => entity.entity_id.startsWith('light.'))
            .map(entity => ({
                id: entity.entity_id,
                name: entity.attributes.friendly_name || entity.entity_id
            }));

        console.log("Found", lights.length, "lights");
        res.json(lights);

    } catch (error) {
        console.error("Error fetching lights:", error.message);
        res.status(500).json({ error: 'Failed to fetch lights' });
    }
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
});