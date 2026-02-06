const express = require('express');
const cors = require('cors');

const waitlistRoutes = require('./routes/waitlist.routes');
const usersRoutes = require('./routes/users.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/waitlist', waitlistRoutes);
app.use('/users', usersRoutes);

module.exports = app;
