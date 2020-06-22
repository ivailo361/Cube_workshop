const fs = require('fs');
const fsPromises = require('fs').promises
const path = require('path')
const Cube = require('../models/cube.js')

function getData(callback) {
    let filePath = path.normalize(
        path.join(__dirname, '../config/database.json')
    );
//    let data = await fsPromises.readFile(filePath) 
//    return JSON.parse(data)
    let data = fs.readFileSync(filePath)
    return JSON.parse(data)
}

function writeData(inputData, callback) {
    let { name, description, imageUrl, difficultyLevel } = inputData
    let json = getData()
    if (json.find(x => x.name === name)) {
        return res.end('The name exists, please choose another one')
    }
    let obj = new Cube(name, imageUrl, description, difficultyLevel)
    json.push(obj)
    fs.writeFile(path.join(__dirname, '../config/database.json'), JSON.stringify(json), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
        callback()
      });
}

function getCube(id) {
    let links = getData()
    return links.find(x => x.id === id)
}

function searchCube(inputData) {
    let search = new RegExp(inputData.search, 'i')

    let selected = getData()
        .filter(x => x.name.match(search))
        .filter(x => Number(x.level) >= Number(inputData.from))
        .filter(x => {
            if (inputData.to === '' || Number(x.level) <= Number(inputData.to)) return x
        })

    let obj = {}
    obj.links = selected
    obj.params = inputData
    
    return obj
}

module.exports = {
    getData,
    writeData,
    getCube,
    searchCube
}