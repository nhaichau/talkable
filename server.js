const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./routes/api/users');

// Connect to DB
const db = require('./config/settings').mongoURI;
mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err));

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

// Passport settings
require('./config/passport-settings');

// All routes
app.use('/api/users', users);
app.get('/', (req, res) => res.send('Hello world!'));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`REST server is running on port ${port}`));