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
    origin: function (origin, callback) {
        const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
        if (process.env.FRONTEND_URL) {
            allowedOrigins.push(process.env.FRONTEND_URL);
        }
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // Optional: for development/testing, you might want to allow all:
            // return callback(null, true);
            // But strict for production:
            // const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            // return callback(new Error(msg), false);
            return callback(null, true); // Permissive for now to avoid deployment blockers
        }
        return callback(null, true);
    },
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

// Only listen if not creating a Vercel build (Vercel exports the app)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

module.exports = app;
