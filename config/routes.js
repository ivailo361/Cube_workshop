const express = require('express');
const router = express.Router()
const url = require('url');

const MongoDB = require("../models/mongo");
const db = new MongoDB();

const { 
    writeData,
    getCube,
    searchCube,
    deleteCube,
    addAccessoriesInCube,
    findMissingAccessories,
    deleteArrayRecords
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
        await writeData('cubesList', req.body)
        let success = `You successfuly added cube with name ${req.body.name}`
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
        let response = await writeData('accessories', req.body)
        let success = `newly added accessory has ID ${response} and name ${req.body.name}`
        res.render('createAccessory.hbs', { success });
    }
    catch (e) {
        const error = e.message;
        res.render('createAccessory.hbs', { error });
    }
});

router.get('/attach/accessory/:id', async function (req, res, next) {
    let cubeId = req.params.id
    const [item, cube] = await Promise.all(
        [findMissingAccessories('accessories', cubeId, true), getCube('cubesList', cubeId)]
    )
    let success = req.query.added === "success"
        ? `You successfully added accessory to cube name ${cube.name}`
        : false

    res.render('attachAccessory', { ...cube, item, success })
});

router.post('/attach/accessory/:id', async function (req, res, next) {
    try {
        const cubeId = req.params.id
        const accessoryId = req.body.accessory
        await addAccessoriesInCube('cubesList', 'accessories', cubeId, accessoryId)
        console.log(req.session)
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
        findMissingAccessories('accessories', cubeId, false), 
        getCube('cubesList', cubeId)
    ])

    res.render('details.hbs', { cube, accessory })
});

router.get('/details/:cubeId/delete/:accessId', async function (req, res, next) {
    const cubeId = req.params.cubeId
    const accessId = req.params.accessId
    await Promise.all([
        deleteArrayRecords('cubesList', cubeId, accessId),
        deleteArrayRecords('accessories', cubeId, accessId)
    ])
    res.redirect(`/details/${cubeId}`)
});

router.get('/delete/:id', async function (req, res, next) {
    let id = req.params.id
    await deleteCube('cubesList', id)
    res.redirect('/')
});

router.post('/search', async (req, res, next) => {
    let obj = await searchCube('cubesList', req.body)
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