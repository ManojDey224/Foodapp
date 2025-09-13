const mongoose = require('mongoose');

const connectionDb = async () => {
    try {
        const connectionString = process.env.CONNECTION_STRING || 'mongodb://localhost:27017/recipe-app';
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(connectionString);
        console.log('✅ Connected to the database successfully');
        console.log('Database:', mongoose.connection.db.databaseName);
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
        console.error('Full error:', err);
        // Don't exit the process, just log the error
        // This allows the server to start even without DB connection
    }
}

module.exports = connectionDb;
