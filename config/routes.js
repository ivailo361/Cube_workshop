const express = require('express');
const router = express.Router()
const url = require('url');
const bcrypt = require('bcrypt');

const { authUser, generateToken, decodeToken } = require('../models/auth')
const errorHandle = require('../models/errorHandler')

const env = process.env.NODE_ENV || 'development';
const config = require('./config')[env];


const MongoDB = require("../models/mongo");
const db = new MongoDB();

const {
    validateInput,
    searchCube,
    messages
} = require('../models/func.js')

// module.exports = (app) => {
router.get('/', authUser, async function (req, res) {
    // console.log(req.respond);
    // let respond = req.respond || false;
    const links = await db.getData('cubesList');
    const loggedIn = req.user || false;
    const success = messages(req.query.del, req.query.cubeName) || false
    res.render('index.hbs', { links, loggedIn, success, layout: "main.hbs", title: "Cubics" });

}, errorHandle('index'));


router
    .get('/register', authUser, (req, res, next) => {
        if (req.user) {
            return next(new Error('There is no such page'))
        }
        res.render('registerPage')
    }, errorHandle('index'))
    .post('/register', async (req, res, next) => {
        try {
            let data = validateInput(req.body)
            let { username, password } = data
            let user = await db.getUser('users', username);
            if (user !== null) {
                throw new Error('The user already exist')
            }
            let salt = config.db_saltRounds
            let hashed = await bcrypt.hash(password, salt)
            const result = await db.insertData('users', { username, password: hashed })
            if (result) {
                const success = `You successfully added user with name: ${username}`
                res.render('loginPage', { success })
            }
        }
        catch (e) {
            next(e)
        }
    }, errorHandle('registerPage'));

router
    .get('/login', authUser, (req, res, next) => {
        if (req.user) {
            return next(new Error('There is no such page'))
        }
        res.render('loginPage')
    }, errorHandle('index'))
    .post('/login', async (req, res, next) => {
        try {
            let { username, password } = req.body
            let user = await db.getUser('users', username);
            // validateInput({dbUser: user, dbUserPass: user.password, formPass: password})
            if (user === null) {
                throw new Error('The user does not exist')
            }
            let isPasswordsMatch = await bcrypt.compare(password, user.password)
            if (!isPasswordsMatch) {
                throw new Error('Wrong password please try again')
            }
            const token = generateToken({ username, creatorId: user._id }, { expiresIn: '20m' })
            res.cookie('token', token)
            res.redirect('/')
        }
        catch (e) {
            next(e)
        }
    }, errorHandle('loginPage'));

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    res.redirect('/')
})

router
    .get('/create/cube', authUser, function (req, res, next) {
        if (!req.user) {
            return next(new Error("Permission denied."))
        }
        let success = req.query.added === "success"
            ? `You successfully created a cube with name ${req.query.cubeName}`
            : false
        res.render('createCube.hbs', { loggedIn: req.user, success })
    }, errorHandle('about'))

    .post('/create/cube', authUser, async (req, res, next) => {
        try {
            const creatorId = req.user.creatorId
            console.log(creatorId)
            let data = validateInput(req.body)
            // console.log(req.user)
            data.creatorId = creatorId
            const result = await db.insertData('cubesList', data)

            console.log(`The document with id ${result} has been saved!`)
            res.redirect(url.format({
                pathname: `/create/cube`,
                query: {
                    'added': 'success',
                    'cubeName': data.name
                }
            }))
        } catch (e) {
            next(e)
        }
    }, errorHandle('404'))

router.get('/create/accessory', authUser, function (req, res, next) {
    if (!req.user) {
        return next(new Error("Permission denied."))
    }
    res.render('createAccessory.hbs', { loggedIn: req.user });
}, errorHandle('404'))

router.post('/create/accessory', authUser, async (req, res, next) => {
    try {
        let data = validateInput(req.body)
        const result = await db.insertData('accessories', data)
        console.log(`The document with id ${result} has been saved!`)
        let success = `newly added accessory has ID ${result} and name ${req.body.name}`
        res.render('createAccessory.hbs', { loggedIn: req.user, success });
    }
    catch (e) {
        next(e)
    }
}, errorHandle('404'))

router.get('/attach/accessory/:id', authUser, async function (req, res, next) {
    if (!req.user) {
        return next(new Error("You don't have a permissions to do that"))
    }
    let cubeId = req.params.id
    const [item, cube] = await Promise.all([
        db.extractCubesFromAccessories('accessories', cubeId, true),
        db.getData('cubesList', cubeId)
    ])
    let success = messages(req.query.added, cube[0].name)

    res.render('attachAccessory', { loggedIn: req.user, ...cube[0], item, success })
}, errorHandle('404'))

router.post('/attach/accessory/:id', authUser, async function (req, res, next) {
    const cubeId = req.params.id
    const accessoryId = req.body.accessory
    await db.addAccessories('cubesList', 'accessories', cubeId, accessoryId)
    res.redirect(url.format({
        pathname: `/attach/accessory/${cubeId}`,
        query: {
            'added': 'success'
        }
    }))
}, errorHandle('404'))

router.get('/edit/:id', authUser, async (req, res, next) => {
    // const cubeId = req.params.id
    // const creatorId = req.user.creatorId
    const { cube } = req.cookies
    const unhashedCube = decodeToken(cube)
    // console.log('Cookies: ', req.cookies)
    res.render('editCubePage', { loggedIn: req.user, ...unhashedCube })
}, errorHandle('404'))

router.post('/edit/:id', authUser, async (req, res, next) => {
    try {
        const cubeId = req.params.id;
        let data = validateInput(req.body)
        const result = await db.updateData('cubesList', cubeId, data)
        if (result.matchedCount) {
            res.redirect(url.format({
                pathname: `/details/${cubeId}`,
                query: {
                    'added': 'update'
                }
            }))
        } else (
            next(new Error("I didn't update anything"))
        )
    } catch (e) {
        next(e)
    }
}, errorHandle('404'));

router.get('/details/:id', authUser, async function (req, res, next) {
    // if (!req.user) {
    //     return res.redirect('/')
    // }
    try {
        const cubeId = req.params.id
        const [accessory, cube] = await Promise.all([
            db.extractCubesFromAccessories('accessories', cubeId, false),
            db.getData('cubesList', cubeId)
        ])
        // let ivo = cubeId.map(x => x < 2)
        const isCreator = (req.user !== undefined && cube[0].creatorId === req.user.creatorId) || false
        const success = messages(req.query.added, cube[0].name)
        const hashedCube = generateToken(cube[0], { expiresIn: '20m' })
        res.cookie('cube', hashedCube)
        res.render('details.hbs', { loggedIn: req.user, isCreator, ...cube[0], accessory, success })
    }
    catch (e) {
        next(e)
    }
}, errorHandle('details'))

router.get('/details/:cubeId/delete/:accessId', authUser, async function (req, res, next) {
    if (!req.user) {
        return next()
    }
    const cubeId = req.params.cubeId
    const accessId = req.params.accessId
    let [resultCube, resultAccess] = await Promise.all([
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
}, errorHandle('404'))

router.get('/delete/:id/', authUser, async function (req, res, next) {
    const { cube } = req.cookies
    const unhashedCube = decodeToken(cube)
    res.render('deleteCubePage', { loggedIn: req.user, ...unhashedCube })
}, errorHandle('404'))

router.post('/delete/:id', authUser, async function (req, res, next) {
    if (!req.user) {
        return next(new Error('there is no such cube please reload'))
    }
    let cubeId = req.params.id
    let cubeName = req.body.name
    let result = await db.deleteOneCube('cubesList', cubeId)
    console.log(`${result.deletedCount} document was deleted.`);
    res.clearCookie('cube')
    res.redirect(url.format({
        pathname: `/`,
        query: {
            'del': 'deleteCube',
            'cubeName': cubeName,
        }
    }))
}, errorHandle('404'))

router.post('/search', authUser, async (req, res, next) => {
    let database = await db.getData('cubesList')
    let { links, params } = searchCube(database, req.body)
    res.render('index', { loggedIn: req.user, links, params })
}, errorHandle('404'))

router.get('/about', authUser, function (req, res, next) {
    res.render('about', { loggedIn: req.user });
}, errorHandle('about'));

router.all('*', authUser, (req, res) => {
    res.render('404.hbs', { loggedIn: req.user })
}, errorHandle('404'));



// };

module.exports = router