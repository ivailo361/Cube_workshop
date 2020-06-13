const express = require('express');
const fs = require('fs')
const path = require('path')

function getData() {
    let filePath = path.normalize(
        path.join(__dirname, '../config/database.json')
    );
    let data = fs.readFileSync(filePath)
    return JSON.parse(data)
}

function writeData(data) {
    fs.writeFile(path.join(__dirname, '../config/database.json'), JSON.stringify(data), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
}

function getCube(id) {
    let links = getData()
    return links.find(x => x.id === id)
}

module.exports = {
    getData,
    writeData,
    getCube
}