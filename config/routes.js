const express = require('express');
// var router = express.Router();
// const links = require('../config/database.json')
const fs = require('fs')
const path = require('path')
const uniqid = require('uniqid');
const { getData } = require('../models/func.js')


let uniqueId = 4

module.exports = (app) => {
    app.get('/', function (req, res, next) {
        // console.log(getData)
        // let filePath = path.normalize(
        //     path.join(__dirname, '/database.json')
        // );
        // let data = fs.readFileSync(filePath)
        req.links = getData('../config/database.json')

        next()
    }, function (req, res) {
        let links = req.links
        res.render('index', { links })

    });

    app.post('/search', (req, res, next) => {
        let search = new RegExp(req.body.search, 'i')
        database = getData('../config/database.json')

        let selected = database
            .filter(x => x.name.match(search))
            .filter(x => Number(x.level) >= Number(req.body.from))
            .filter(x => {
                if (req.body.to === '' || Number(x.level) <= Number(req.body.to)) return x
            })

        let obj = {}
        obj.links = selected
        obj.params = req.body
        // if (selected[0] === undefined) {
        //     res.redirect('/')
        //     return
        // }
        res.render('index', obj)
    })


    app.get('/about', function (req, res, next) {
        res.render('about');
    });

    app.get('/create', function (req, res, next) {
        res.render('create.hbs')
    });

    app.post('/create', (req, res) => {

        // let json = getData('../config/database.json')

        // let filePath = path.normalize(
        //     path.join(__dirname, '/database.json')
        // )

        // fs.readFile(filePath, 'utf-8', (err, data) => {
        let { name, description, imageUrl, difficultyLevel } = req.body
        let json = getData('../config/database.json')
        if (json.find(x => x.name === name)) return res.end('The name exists, please choose another one')

        let obj = { id: uniqid(), name, description, url: imageUrl, level: difficultyLevel }
        json.push(obj)
        console.log(json)

        fs.writeFile(__dirname + '/database.json', JSON.stringify(json), (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
        // })
        res.redirect('/')
        // res.render('create', {
        //     helpers: {
        //         log: function () { return "BAR" }
        //     },
        // })

    });

    app.get('/details/:id', function (req, res, next) {
        let links = getData('../config/database.json')
        let id = req.params.id
        let record = links.find(x => x.id === id)
        res.render('details.hbs', record)
    });

    app.all('*', (req, res) => {
        res.render('404.hbs')
    })

};

// module.exports = router