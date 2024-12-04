const fs = require('fs');  // This can be removed if you're not handling local file deletions.
const path = require('path');
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

// Remove local static file serving since images are now stored on S3
// app.use('/uploads/images', express.static(path.join('uploads', 'images')));
app.use(express.static(path.join('public')));  // Serve any public files like HTML, JS, etc.

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

// Use the routes that handle places and users
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

// Remove this line because files are stored on S3 now
// app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

// Error-handling middleware
app.use((error, req, res, next) => {
    // You can remove the fs.unlink logic since you're no longer storing files locally
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, err => {
            console.log(err);
        });
    }
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!' });
});

// Database connection
mongoose
    .connect(
        `${process.env.MongoDB}`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        }
    )
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        app.listen(process.env.PORT || 5001 , () => {
            console.log(`Server is running on port ${process.env.PORT || 5001}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
