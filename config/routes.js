const express = require('express');
const router = express.Router()
const url = require('url');

const MongoDB = require("../models/mongo");
const db = new MongoDB();

const { 
    validateInput,
    searchCube,
    messages
} = require('../models/func.js')

// module.exports = (app) => {
router.get('/', function (req, res, next) {
    // console.log(getData)
    // let filePath = path.normalize(=
    //     path.join(__dirname, '/database.json')
    // );
    // let data = fs.readFileSync(filePath)
    // req.links = getData()

    next()
}, async function (req, res) {
    let links = await db.getData('cubesList')
    res.render('index.hbs', { links, layout: "main.hbs", title: "Cubics" });

});

router.get('/create/cube', function (req, res, next) {
    res.render('createCube.hbs')
});

router.post('/create/cube', async (req, res, next) => {
    try {
        const data = validateInput(req.body)
        const result = await db.insertData('cubesList', data)
        console.log(data)
        console.log(`The document with id ${result} has been saved!`)
        const success = `You successfully added cube with name ${req.body.name}`
        res.render('createCube.hbs', { success })
    } catch (e) {
        const error = e.message
        res.render('createCube.hbs', {
            error
            // helpers: {
            //     error: function () {
            //         return `<p id="error">${error.message}</p>`
            //     }
            // },
        })
    }
    next()
}, async (req, res) => {

});

router.get('/create/accessory', function (req, res, next) {
    res.render('createAccessory.hbs');
});

router.post('/create/accessory', async (req, res, next) => {
    try {
        let data = validateInput(req.body)
        const result = await db.insertData('accessories', data)
        console.log(`The document with id ${result} has been saved!`)
        let success = `newly added accessory has ID ${result} and name ${req.body.name}`
        res.render('createAccessory.hbs', { success });
        
    }
    catch (e) {
        const error = e.message;
        res.render('createAccessory.hbs', { error });
    }
});

router.get('/attach/accessory/:id', async function (req, res, next) {
    let cubeId = req.params.id
    const [item, cube] = await Promise.all([
        db.extractCubesFromAccessories('accessories', cubeId, true), 
        db.getData('cubesList', cubeId)
    ])

    let success = messages(req.query.added, cube[0].name)
    // let success = req.query.added === "success"
    //     ? `You successfully added accessory to cube name ${cube[0].name}`
    //     : false

    res.render('attachAccessory', { ...cube[0], item, success })
});

router.post('/attach/accessory/:id', async function (req, res, next) {
    try {
        const cubeId = req.params.id
        const accessoryId = req.body.accessory
        await db.addAccessories('cubesList', 'accessories', cubeId, accessoryId)
        res.redirect(url.format({
            pathname: `/attach/accessory/${cubeId}`,
            query: {
                'added': 'success'
            }
        }))
    }
    catch (e) {
        const error = e.message;
        res.render('attachAccessory.hbs', { error });
    }
});

router.get('/details/:id', async function (req, res, next) {
    let cubeId = req.params.id
    const [accessory, cube] = await Promise.all([
        db.extractCubesFromAccessories('accessories', cubeId, false), 
        db.getData('cubesList', cubeId)
    ])
    let success = messages(req.query.added, cube[0].name)
    res.render('details.hbs', { ...cube[0], accessory, success })
});

router.get('/details/:cubeId/delete/:accessId', async function (req, res, next) {
    const cubeId = req.params.cubeId
    const accessId = req.params.accessId
    let [ resultCube, resultAccess ] = await Promise.all([
        db.removeIdFromArray('cubesList', cubeId, accessId),
        db.removeIdFromArray('accessories', cubeId, accessId)
    ])
    console.log(`Successfully deleted ${resultCube.modifiedCount} accessory`)
    res.redirect(url.format({
        pathname: `/details/${cubeId}`,
        query: {
            'added': 'deletedAccessories'
        }
    }))
});

router.get('/delete/:id', async function (req, res, next) {
    let id = req.params.id
    let result = await db.deleteOneCube('cubesList', id)
    console.log(`${result.deletedCount} document was deleted.`);
    res.redirect('/')
});

router.post('/search', async (req, res, next) => {
    let database = await db.getData('cubesList')
    let obj = searchCube(database, req.body)
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