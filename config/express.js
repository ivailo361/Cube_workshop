const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path')
// const bodyParser = require('body-parser'); it is integrated in express


module.exports = (app) => {

    app.engine('.hbs', handlebars({
        extname: '.hbs',
        helpers: {
            log: function () { return "LOG" },
            addCubeId: function (accessory, cubeId) { accessory.forEach(x => x.cubeId = cubeId) },
         },
        partialsDir: './views/partials', /* ./'partials' */
        // defaultLayout: false,
        layoutsDir: path.join(__dirname, '../views/layouts'),
    }));
    app.set('view engine', '.hbs');

    app.use(express.static(path.join(__dirname, '../static')));
    // app.use(express.static('static'));

    app.use(express.urlencoded({ extended: true }))
    // app.use(bodyParser.urlencoded({ extended: true }));

};



