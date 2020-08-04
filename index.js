const env = process.env.NODE_ENV || 'development';

const config = require('./config/config')[env];
const express = require('express');
const app = express()


require('./config/express')(app);

const route = require('./config/routes.js')
app.use('/', route)

// require('./config/routes')(app);



app.listen(config.port, console.log(`Listening on port ${config.port}! Now its up to you...`));