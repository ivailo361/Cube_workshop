const express = require('express');
// var router = express.Router();
// const links = require()
const path = require('path')
const { getData, writeData, getCube } = require('../models/func.js')
const Cube = require('../models/cube.js')


const router = express.Router()

// module.exports = (app) => {
router.get('/', function (req, res, next) {
    // console.log(getData)
    // let filePath = path.normalize(
    //     path.join(__dirname, '/database.json')
    // );
    // let data = fs.readFileSync(filePath)
    // req.links = getData()

    next()
}, function (req, res) {
    let links = req.links
    res.render('index.hbs', { links: getData(), layout: "main.hbs", title: "Cubics" });

});

router.post('/search', (req, res, next) => {
    let search = new RegExp(req.body.search, 'i')
    database = getData()

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


router.get('/about', function (req, res, next) {
    res.render('about');
});

router.get('/create', function (req, res, next) {
    res.render('create.hbs')
});

router.post('/create', (req, res, next) => {

    let { name, description, imageUrl, difficultyLevel } = req.body
    let json = getData()
    if (json.find(x => x.name === name)) return res.end('The name exists, please choose another one')

    let obj = new Cube(name, imageUrl, description, difficultyLevel)
    json.push(obj)
    writeData(json)

    next()
}, function (req, res) {
    res.redirect('/')
    // res.render('create', {
    //     helpers: {
    //         log: function () { return "BAR" }
    //     },
    // })
 
});

router.get('/details/:id', function (req, res, next) {
    let id = req.params.id
    res.render('details.hbs', getCube(id))
});

router.all('*', (req, res) => {
    res.render('404.hbs')
})

// };

module.exports = router