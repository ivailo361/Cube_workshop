const express = require('express');
const handlebars = require('express-handlebars');
const path = require('path')
const cookieParser = require("cookie-parser")
// const bodyParser = require('body-parser'); it is integrated in express


module.exports = (app) => {

    app.engine('.hbs', handlebars({
        extname: '.hbs',
        helpers: {
            log: function () { return "LOG" },
            addCubeId: function (accessory, cubeId) { accessory.forEach(x => x.cubeId = cubeId) },
            selectDifficultLevel: function(value) {
                document.getElementById('difficulty').setAttribute('value', value)
            }
         },
        partialsDir: './views/partials', /* ./'partials' */
        // defaultLayout: false,
        layoutsDir: path.join(__dirname, '../views/layouts'),
    }));
    app.set('view engine', '.hbs');

    // app.set('env', 'production')

    app.use(express.static(path.join(__dirname, '../static')));
    // app.use(express.static('static'));

    app.use(express.urlencoded({ extended: true }))
    // app.use(bodyParser.urlencoded({ extended: true }));

    app.use(cookieParser())

};



