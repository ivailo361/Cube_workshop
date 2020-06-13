const express = require('express');
const router = express.Router()
const { getData, writeData, getCube, searchCube } = require('../models/func.js')

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
    let links = getData()
    res.render('index.hbs', { links, layout: "main.hbs", title: "Cubics" });

});

router.get('/details/:id', function (req, res, next) {
    let id = req.params.id
    res.render('details.hbs', getCube(id))
});

router.get('/create', function (req, res, next) {
    res.render('create.hbs')
});

router.post('/create', (req, res, next) => {
    console.log(req.body)
    writeData(req.body, () => {
        res.redirect('/')
    })
    // function (req, res) {
    // res.redirect('/')
    // res.render('create', {
    //     helpers: {
    //         log: function () { return "BAR" }
    //     },
    // })
});

router.post('/search', (req, res, next) => {
    let obj = searchCube(req.body)
    res.render('index', obj)
})

router.get('/about', function (req, res, next) {
    res.render('about');
});

router.all('*', (req, res) => {
    res.render('404.hbs')
})

// };

module.exports = router