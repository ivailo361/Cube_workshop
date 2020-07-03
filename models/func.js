const { Cube, Accessory } = require("./cube")
const MongoDB = require("./mongo");

const db = new MongoDB();

// function errorHandle(error) {
//     console.log(error)
// }
// async function getData(collectionName) {
//     let data = await db.getAllData(collectionName)
//     return data
// }

async function findMissingAccessories(collection, cubeId, missing) {

    let items = await db.extractCubesFromAccessories(collection, cubeId, missing)
    return items.length === 0 ? false : items
}

async function addAccessoriesInCube(cubesDb, accessDb, cubeId, accessoryId)  {
    let result = await db.addAccessories(cubesDb, accessDb, cubeId, accessoryId)
    return result
}

async function writeData(collectionName, inputData) {
    // console.log(...Object.values(inputData))

    let { name, description, url, difficultyLevel } = inputData
    let obj = {}
    if (collectionName === 'cubesList') {
        obj = new Cube(name, description, url, difficultyLevel)
    }
    else if (collectionName === 'accessories') {
        obj = new Accessory(name, url, description)
    }
    else {
        throw new Error('wrong db name')
    }

    let result = await db.insertData(collectionName, obj)
    console.log('The document has been saved!')
    return result
}

async function getCube(collectionName, cubeId) {
    // let links = await getData(collectionName)
    // return links.find(x => x._id.toString() === id)
    let links = await db.getAllData(collectionName, cubeId)
    return links[0]
}

async function deleteCube(collectionName, id) {
    let result = await db.deleteOneCube(collectionName, id)
    console.log(`${result.deletedCount} document was deleted.`);
    return result.deletedCount
}

async function deleteArrayRecords(collectionName, cubeId, accessId) {
    let result = await db.removeIdFromArray(collectionName, cubeId, accessId)
    console.log(result.modifiedCount)
    return result.modifiedCount
}

async function searchCube(collectionName, inputData) {
    let search = new RegExp(inputData.search, 'i')
    let data = await getData(collectionName)
    let selected = data
        .filter(x => {
            let isNameExist = x.name.match(search);
            let isLevelHigherFrom = Number(x.level) >= Number(inputData.from);
            let isLevelLowerTo = (inputData.to === '' || Number(x.level) <= Number(inputData.to))
            if (isNameExist && isLevelHigherFrom && isLevelLowerTo) return x
        })

    let obj = {}
    obj.links = selected
    obj.params = inputData

    return obj
}

module.exports = {

    writeData,
    getCube,
    searchCube,
    deleteCube,
    addAccessoriesInCube,
    findMissingAccessories,
    deleteArrayRecords
}