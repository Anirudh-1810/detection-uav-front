const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer setup for temporarily saving files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        // Unique filename to avoid collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage });

// Health check
app.get('/', (req, res) => {
    res.send('Express Proxy for YOLO Service Running');
});

// Detection Route
app.post('/api/predict', upload.single('file'), async (req, res) => {
    handleProxyRequest(req, res, '/predict');
});

// Video Analysis Route
app.post('/api/analyze-video', upload.single('file'), async (req, res) => {
    handleProxyRequest(req, res, '/analyze-video');
});

// Stats Route
app.get('/api/stats', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_SERVICE_URL}/stats`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

// Zone Config Route (Mock for now to satisfy frontend)
app.post('/api/config/zones', (req, res) => {
    res.json({ success: true, message: "Zones updated (Mock)" });
});

// Proxy static videos
app.use('/api/videos', (req, res) => {
    const targetUrl = `${PYTHON_SERVICE_URL}/videos${req.url}`;
    req.pipe(axios.get(targetUrl, { responseType: 'stream' }).catch(err => {
        console.error(`Error proxying video from ${targetUrl}:`, err.message);
        res.status(500).send('Error proxying video');
    })).pipe(res);
});

async function handleProxyRequest(req, res, endpoint) {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;

    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        console.log(`Forwarding ${req.file.originalname} to Python service at ${PYTHON_SERVICE_URL}${endpoint}`);

        const response = await axios.post(`${PYTHON_SERVICE_URL}${endpoint}`, formData, {
            headers: { ...formData.getHeaders() },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        fs.unlink(filePath, (err) => { if (err) console.error("Error deleting temp file:", err); });
        res.json(response.data);

    } catch (error) {
        console.error(`Error communicating with Python service (${endpoint}):`, error.message);
        fs.unlink(filePath, (err) => { if (err) console.error("Error deleting temp file:", err); });

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ error: "Service Unavailable", details: "Python service down?" });
        }
        res.status(500).json({ error: "Processing failed", details: error.message });
    }
}

app.listen(PORT, () => {
    console.log(`Express Backend running on port ${PORT}`);
});
