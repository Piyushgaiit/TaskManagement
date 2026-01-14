const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');
const seedData = require('./services/seederService');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({ status: "ok", message: "Jira Clone API (MongoDB - Refactored) is running" });
});

app.use('/api', routes); // Mounts all routes under /api

// Error Handler
app.use(errorHandler);

// Seeding
mongoose.connection.once('open', seedData);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
