const express = require('express');
const app = express();
const dotenv = require('dotenv');
const multer = require('multer'); // Add multer import

// Try to load .env file, but don't fail if it doesn't exist
dotenv.config();

const connectionDb = require('./Config/connectionDb');
const cors = require("cors");
const path = require('path');

const PORT = process.env.PORT || 5000;

// Connect to database
connectionDb();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
    origin: true,
    credentials: true
}));
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'Public/images')));

// Add this line for multer to work with text fields
//app.use(multer().none());

// Routes
app.use("/", require("./routes/User"));
app.use('/recipe', require('./routes/recipe'));

app.listen(PORT, (err) => {
    if (err) {
        console.error('Server failed to start:', err);
    } else {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Static files served from: ${path.join(__dirname, 'Public/images')}`);
    }
});