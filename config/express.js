const express = require('express');
const handlebars = require('express-handlebars');

const bodyParser = require('body-parser');


module.exports = (app) => {
    
    app.engine('.hbs', handlebars({ 
        extname: '.hbs',
        helpers: {
            log: function () { return "LOG"}
        },
        partialsDir: './partials',
        defaultLayout: false,
        // layoutsDir: __dirname + '/public/views/layouts',
    }));
    app.set('view engine', '.hbs');

    app.use(express.static('static'))

    app.use(bodyParser.urlencoded({ extended: true }));

};

// handlebars.getPartials().then(function (partials) {
//     console.log(partials);
//     // => { 'foo/bar': [Function],
//     // =>    title: [Function] }
// });